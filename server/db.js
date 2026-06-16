const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection pool
let pool = null;

/**
 * Initialize the PostgreSQL connection pool
 * Uses DATABASE_URL environment variable if available
 * Falls back to local defaults if not configured
 */
async function initializePool() {
    if (pool) {
        console.log('✅ Database pool already initialized');
        return pool;
    }

    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
        console.log('⚠️ DATABASE_URL not set - database operations will be skipped');
        console.log('💡 Set DATABASE_URL to enable persistent config storage');
        return null;
    }

    try {
        pool = new Pool({
            connectionString: DATABASE_URL,
            // Connection pool settings
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Test connection
        const client = await pool.connect();
        console.log('✅ Database connection pool initialized');
        client.release();

        // Create schema on startup
        await ensureSchema();

        return pool;
    } catch (error) {
        console.error('❌ Failed to initialize database pool:', error.message);
        pool = null;
        return null;
    }
}

/**
 * Execute a parameterized query
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {array} params - Parameters to inject
 * @returns {Promise<object>} Query result
 */
async function query(text, params) {
    if (!pool) {
        throw new Error('Database pool not initialized');
    }

    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
}

/**
 * Create schema if it doesn't exist
 * Runs automatically on pool initialization
 */
async function ensureSchema() {
    if (!pool) {
        console.log('⏭️ Skipping schema creation - database not available');
        return;
    }

    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS deployed_configs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                config_key VARCHAR(255) NOT NULL UNIQUE,
                config_data JSONB NOT NULL,
                deployed_at TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_deployed_configs_key ON deployed_configs(config_key);
        `;

        await pool.query(createTableQuery);
        console.log('✅ Database schema initialized');

        // Check if table is empty and seed with defaults if needed
        await seedDefaultsIfEmpty();
    } catch (error) {
        console.error('❌ Error creating schema:', error.message);
        throw error;
    }
}

/**
 * Load default configs into database if table is empty
 * This ensures the database has initial data on first run
 * @param {string} defaultsDir - Path to defaults directory
 */
async function seedDefaultsIfEmpty(defaultsDir) {
    if (!pool) return;

    try {
        // Check if table has any data
        const countResult = await pool.query('SELECT COUNT(*) FROM deployed_configs');
        const count = parseInt(countResult.rows[0].count);

        if (count > 0) {
            console.log(`✅ Database already populated with ${count} configs`);
            return;
        }

        console.log('📥 Seeding database with default configs...');

        // Load defaults from filesystem
        if (!defaultsDir || !fs.existsSync(defaultsDir)) {
            console.log('⚠️ No defaults directory provided - skipping seed');
            return;
        }

        const CONFIG_FILES = ['widgets.json', 'theme.json', 'navigation.json', 'pages.json', 'config.json'];
        let seedCount = 0;

        for (const fileName of CONFIG_FILES) {
            const filePath = path.join(defaultsDir, fileName);
            if (fs.existsSync(filePath)) {
                try {
                    const configData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    await deployConfig(fileName, configData);
                    console.log(`  ✅ Seeded ${fileName}`);
                    seedCount++;
                } catch (error) {
                    console.error(`  ❌ Error seeding ${fileName}:`, error.message);
                }
            }
        }

        console.log(`✅ Database seeded with ${seedCount} default configs`);
    } catch (error) {
        console.error('❌ Error seeding defaults:', error.message);
    }
}

/**
 * Get a single config from the database
 * @param {string} configKey - The config filename (e.g., 'widgets.json')
 * @returns {Promise<object|null>} Config data or null if not found
 */
async function getConfig(configKey) {
    if (!pool) {
        return null;
    }

    try {
        const result = await query(
            'SELECT config_data, updated_at FROM deployed_configs WHERE config_key = $1',
            [configKey]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].config_data;
    } catch (error) {
        console.error(`Error fetching config ${configKey}:`, error.message);
        return null;
    }
}

/**
 * Get all configs from the database
 * @returns {Promise<object>} Object with config_key -> config_data mapping
 */
async function getAllConfigs() {
    if (!pool) {
        return {};
    }

    try {
        const result = await query('SELECT config_key, config_data FROM deployed_configs ORDER BY config_key');
        const configs = {};

        result.rows.forEach(row => {
            configs[row.config_key] = row.config_data;
        });

        return configs;
    } catch (error) {
        console.error('Error fetching all configs:', error.message);
        return {};
    }
}

/**
 * Deploy/save a config to the database
 * Uses UPSERT to insert new or update existing configs
 * @param {string} configKey - The config filename (e.g., 'widgets.json')
 * @param {object} configData - The config data to save
 * @returns {Promise<object>} Insert/update result
 */
async function deployConfig(configKey, configData) {
    if (!pool) {
        throw new Error('Database pool not initialized');
    }

    try {
        const result = await query(
            `INSERT INTO deployed_configs (config_key, config_data, deployed_at, created_at, updated_at)
             VALUES ($1, $2, NOW(), NOW(), NOW())
             ON CONFLICT (config_key) DO UPDATE
             SET config_data = $2, updated_at = NOW(), deployed_at = NOW()
             RETURNING id, config_key, deployed_at, updated_at`,
            [configKey, JSON.stringify(configData)]
        );

        console.log(`✅ Config deployed: ${configKey}`);
        return result.rows[0];
    } catch (error) {
        console.error(`Error deploying config ${configKey}:`, error.message);
        throw error;
    }
}

/**
 * Delete a config from the database
 * @param {string} configKey - The config filename to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteConfig(configKey) {
    if (!pool) {
        throw new Error('Database pool not initialized');
    }

    try {
        const result = await query(
            'DELETE FROM deployed_configs WHERE config_key = $1 RETURNING id',
            [configKey]
        );

        if (result.rows.length === 0) {
            console.log(`⚠️ Config not found for deletion: ${configKey}`);
            return false;
        }

        console.log(`✅ Config deleted: ${configKey}`);
        return true;
    } catch (error) {
        console.error(`Error deleting config ${configKey}:`, error.message);
        throw error;
    }
}

/**
 * Get database connection status
 * @returns {Promise<object>} Status information
 */
async function getStatus() {
    if (!pool) {
        return {
            status: 'disconnected',
            message: 'Database pool not initialized',
            isDatabaseAvailable: false
        };
    }

    try {
        const client = await pool.connect();
        const configCount = await pool.query('SELECT COUNT(*) FROM deployed_configs');
        client.release();

        return {
            status: 'connected',
            isDatabaseAvailable: true,
            configCount: parseInt(configCount.rows[0].count),
            maxConnections: pool.options.max,
            activeConnections: pool.totalCount
        };
    } catch (error) {
        return {
            status: 'error',
            isDatabaseAvailable: false,
            error: error.message
        };
    }
}

/**
 * Close the database connection pool
 * Should be called on server shutdown
 */
async function closePool() {
    if (pool) {
        await pool.end();
        console.log('✅ Database pool closed');
        pool = null;
    }
}

module.exports = {
    initializePool,
    query,
    ensureSchema,
    seedDefaultsIfEmpty,
    getConfig,
    getAllConfigs,
    deployConfig,
    deleteConfig,
    getStatus,
    closePool,
    // Expose pool for advanced usage
    getPool: () => pool
};
