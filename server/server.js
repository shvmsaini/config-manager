
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

const DEPLOY_DIR = path.join(__dirname, 'deployed_configs');
const DEFAULT_DIR = path.join(__dirname, 'defaults');
const CONFIG_DIR = path.join(__dirname, 'configs');

const CONFIG_FILES = ['widgets.json', 'theme.json', 'navigation.json', 'pages.json', 'config.json'];

// Ensure directories exist
[DEPLOY_DIR, DEFAULT_DIR, CONFIG_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Request Logging (moved before route definitions)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Load server defaults for schemas
const loadServerDefaults = () => {
    const schemas = {};
    CONFIG_FILES.forEach(fileName => {
        const defaultPath = path.join(DEFAULT_DIR, fileName);
        if (fs.existsSync(defaultPath)) {
            try {
                schemas[fileName] = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
            } catch (err) {
                console.error(`Error loading default ${fileName}:`, err);
                schemas[fileName] = {};
            }
        }
    });
    return schemas;
};

// GET endpoint for schemas (for UI generation)
app.get('/api/schemas', (req, res) => {
    try {
        const schemas = loadServerDefaults();
        res.json({ schemas });
    } catch (error) {
        console.error('Error fetching schemas:', error);
        res.status(500).json({ error: 'Failed to fetch schemas' });
    }
});

// Helper: Read config with fallback to defaults
// Now tries database first, then falls back to filesystem
async function readConfigWithFallback(fileName) {
    // Try to get from database first
    try {
        const dbConfig = await db.getConfig(fileName);
        if (dbConfig) {
            return dbConfig;
        }
    } catch (error) {
        console.error(`Error reading from database for ${fileName}:`, error.message);
        // Fall through to filesystem
    }

    // Fall back to filesystem defaults
    const defaultPath = path.join(DEFAULT_DIR, fileName);

    if (fs.existsSync(defaultPath)) {
        try {
            return JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
        } catch (err) {
            console.error(`Error reading default ${fileName}:`, err);
        }
    }

    return {};
}

// Helper: Get property order template from defaults (for ordering preserved UI display)
function getPropertyOrder(fileName) {
    const defaultPath = path.join(DEFAULT_DIR, fileName);
    if (fs.existsSync(defaultPath)) {
        try {
            const defaultData = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
            return Object.keys(defaultData);
        } catch (error) {
            console.error(`Error reading default ${fileName} for ordering:`, error.message);
            return [];
        }
    }
    return [];
}

// Helper: Reorder object properties to match default template
function orderObjectProperties(data, propertyOrder) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return data;
    }

    const ordered = {};
    const originalKeys = Object.keys(data);

    // Add properties in template order first
    propertyOrder.forEach(key => {
        if (originalKeys.includes(key)) {
            ordered[key] = data[key];
        }
    });

    // Add any remaining properties not in template (preserve their order)
    originalKeys.forEach(key => {
        if (!propertyOrder.includes(key)) {
            ordered[key] = data[key];
        }
    });

    return ordered;
}

// GET endpoint to fetch all configs with fallback
app.get('/api/configs', async (req, res) => {
    try {
        const configs = {};

        // Try to get all from database first
        const dbConfigs = await db.getAllConfigs();

        // If database has some configs, use them with fallback to defaults
        CONFIG_FILES.forEach(fileName => {
            if (dbConfigs[fileName]) {
                // If we have default template, use it to order properties consistently
                const propertyOrder = getPropertyOrder(fileName);
                if (propertyOrder.length > 0) {
                    configs[fileName] = orderObjectProperties(dbConfigs[fileName], propertyOrder);
                } else {
                    configs[fileName] = dbConfigs[fileName];
                }
            } else {
                // Fall back to filesystem defaults if not in database
                const defaultPath = path.join(DEFAULT_DIR, fileName);
                if (fs.existsSync(defaultPath)) {
                    try {
                        configs[fileName] = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
                    } catch (err) {
                        console.error(`Error reading default ${fileName}:`, err);
                        configs[fileName] = {};
                    }
                } else {
                    configs[fileName] = {};
                }
            }
        });

        res.json({ files: configs });
    } catch (error) {
        console.error('Error fetching configs:', error);
        res.status(500).json({ error: 'Failed to fetch configs' });
    }
});

// Auth Middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'No token provided' });
    }
};

// Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);

    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedHash = process.env.ADMIN_PASSWORD_HASH;

    if (username === expectedUsername && 
        bcrypt.compareSync(password, expectedHash)) {
        
        console.log('Login successful');
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } else {
        console.log('Login failed: Invalid credentials');
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/deploy', authenticateJWT, async (req, res) => {
    const { files } = req.body;

    if (!files) {
        return res.status(400).json({ error: 'No files provided' });
    }

    try {
        console.log('📥 Received files from client:', Object.keys(files));

        // Only deploy expected JSON files
        const validFiles = {};
        CONFIG_FILES.forEach(fileName => {
            if (files[fileName]) {
                validFiles[fileName] = files[fileName];
                console.log(`✅ ${fileName}: ${Object.keys(files[fileName]).length} keys`);
            } else {
                console.log(`Warning: Missing file: ${fileName}`);
            }
        });

        // Deploy to database
        const deployResults = [];
        for (const [fileName, content] of Object.entries(validFiles)) {
            try {
                const result = await db.deployConfig(fileName, content);
                deployResults.push({ file: fileName, success: true, deployed_at: result.deployed_at });
            } catch (error) {
                console.error(`Error deploying ${fileName}:`, error.message);
                deployResults.push({ file: fileName, success: false, error: error.message });
            }
        }

        // Check if all deployments succeeded
        const allSucceeded = deployResults.every(r => r.success);
        if (!allSucceeded) {
            console.error('❌ Some configs failed to deploy');
            return res.status(500).json({
                error: 'Some configs failed to deploy',
                results: deployResults
            });
        }

        console.log('✅ Deployment completed successfully');
        res.json({
            message: 'Deployment successful',
            results: deployResults
        });

    } catch (error) {
        console.error('Deployment failed:', error);
        res.status(500).json({ error: `Deployment failed: ${error.message}` });
    }
});

// API endpoints to serve config files
// GET /api/config/:filename - fetch from database (with fallback to defaults)
app.get('/api/config/:filename', async (req, res) => {
    const { filename } = req.params;

    // Security: only allow known config files
    if (!CONFIG_FILES.includes(filename)) {
        return res.status(400).json({ error: 'Invalid config file' });
    }

    try {
        // Try database first
        const dbConfig = await db.getConfig(filename);
        if (dbConfig) {
            // Preserve property ordering using default template if available
            const propertyOrder = getPropertyOrder(filename);
            const orderedConfig = propertyOrder.length > 0
                ? orderObjectProperties(dbConfig, propertyOrder)
                : dbConfig;
            res.type('application/json').json(orderedConfig);
            return;
        }

        // Fall back to default file
        const defaultPath = path.join(DEFAULT_DIR, filename);
        if (fs.existsSync(defaultPath)) {
            const content = fs.readFileSync(defaultPath, 'utf-8');
            res.type('application/json').send(content);
            return;
        }

        return res.status(404).json({ error: `Config file not found: ${filename}` });
    } catch (error) {
        console.error(`Error fetching config ${filename}:`, error);
        res.status(500).json({ error: `Failed to fetch config: ${error.message}` });
    }
});

// GET /api/default/:filename - fetch from defaults only
app.get('/api/default/:filename', (req, res) => {
    const { filename } = req.params;

    // Security: only allow known config files
    if (!CONFIG_FILES.includes(filename)) {
        return res.status(400).json({ error: 'Invalid config file' });
    }

    try {
        const defaultPath = path.join(DEFAULT_DIR, filename);

        if (fs.existsSync(defaultPath)) {
            const content = fs.readFileSync(defaultPath, 'utf-8');
            res.type('application/json').send(content);
        } else {
            return res.status(404).json({ error: `Default config not found: ${filename}` });
        }
    } catch (error) {
        console.error(`Error fetching default ${filename}:`, error);
        res.status(500).json({ error: `Failed to fetch default: ${error.message}` });
    }
});

// GET /api/deployed/:filename - fetch from database only (no fallback)
app.get('/api/deployed/:filename', async (req, res) => {
    const { filename } = req.params;

    // Security: only allow known config files
    if (!CONFIG_FILES.includes(filename)) {
        return res.status(400).json({ error: 'Invalid config file' });
    }

    try {
        const dbConfig = await db.getConfig(filename);
        if (dbConfig) {
            res.type('application/json').json(dbConfig);
            return;
        }

        return res.status(404).json({ error: `Deployed config not found: ${filename}` });
    } catch (error) {
        console.error(`Error fetching deployed config ${filename}:`, error);
        res.status(500).json({ error: `Failed to fetch deployed config: ${error.message}` });
    }
});

// Serve built React frontend (production Docker build copies client/dist → public/)
const PUBLIC_DIR = path.join(__dirname, 'public');
if (fs.existsSync(PUBLIC_DIR)) {
    app.use(express.static(PUBLIC_DIR));
    // Catch-all: let React Router handle client-side routes
    // Express 5 uses {*path} instead of *
    app.get('{*path}', (req, res) => {
        res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    });
}

// Health and status endpoints
app.get('/health', async (req, res) => {
    const dbStatus = await db.getStatus();
    res.json({
        status: 'healthy',
        database: dbStatus,
        uptime: process.uptime()
    });
});

app.get('/api/status', async (req, res) => {
    const dbStatus = await db.getStatus();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Start server and initialize database
async function startServer() {
    try {
        // Initialize database connection pool
        console.log('\n🔧 Initializing server...');
        await db.initializePool();

        // Seed database with defaults if empty
        await db.seedDefaultsIfEmpty(DEFAULT_DIR);

        // Start listening
        app.listen(PORT, () => {
            console.log(`\n=== CONFIG MANAGER SERVER STARTED ===`);
            console.log(`🚀 HTTP Server running on http://localhost:${PORT}`);
            console.log(`📁 Defaults directory: ${DEFAULT_DIR}`);
            console.log(`💾 Storage mode: ${process.env.DATABASE_URL ? 'PostgreSQL (persistent)' : 'Filesystem + defaults'}`);
            console.log(`🔐 JWT Auth enabled`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`⚙️ Status endpoint: http://localhost:${PORT}/api/status`);
            console.log(`====================================\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n📛 SIGTERM received, shutting down gracefully...');
    await db.closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n📛 SIGINT received, shutting down gracefully...');
    await db.closePool();
    process.exit(0);
});
