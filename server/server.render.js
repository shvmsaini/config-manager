/*
   RENDER.DISK-SAFE SERVER.JS
   Use this version of server.js if deploying to Render with persistent disk storage.

   SETUP:
   1. Create a Render Disk and attach it at mount path: /mnt/data
   2. Set environment variable: USE_MOUNTED_VOLUME=true
   3. The server will automatically use /mnt/data for persistent config storage
*/

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// RENDER DISK SETUP
// If USE_MOUNTED_VOLUME is true, configs are stored in /mnt/data (Render Disk)
// Otherwise, they're stored in the local filesystem (ephemeral)
const USE_MOUNTED_VOLUME = process.env.USE_MOUNTED_VOLUME === 'true';

// Get the correct base path for config storage
const getBasePath = () => {
    if (USE_MOUNTED_VOLUME) {
        // Use Render Disk mount point
        const mountPath = process.env.MOUNT_PATH || '/mnt/data';
        return mountPath;
    } else {
        // Use local filesystem
        return __dirname;
    }
};

const BASE_PATH = getBasePath();

// Directory paths
const DEPLOY_DIR = path.join(BASE_PATH, 'deployed_configs');
const DEFAULT_DIR = path.join(BASE_PATH, 'defaults');
const CONFIG_DIR = path.join(BASE_PATH, 'configs');

const CONFIG_FILES = ['widgets.json', 'theme.json', 'navigation.json', 'pages.json', 'config.json'];

// Ensure directories exist on startup
console.log(`🔧 Setting up config directories at: ${BASE_PATH}`);
console.log(`📁 Using ${USE_MOUNTED_VOLUME ? 'Render Disk (persistent)' : 'local filesystem (ephemeral)'}`);

[DEPLOY_DIR, DEFAULT_DIR, CONFIG_DIR].forEach(dir => {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        } else {
            console.log(`✅ Directory exists: ${dir}`);
        }
    } catch (error) {
        console.error(`❌ Error creating directory ${dir}:`, error);
    }
});

// Request Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Load server defaults for schemas (always from local defaults, not mounted disk)
const loadServerDefaults = () => {
    const schemas = {};
    CONFIG_FILES.forEach(fileName => {
        // Always read defaults from local filesystem (not Render Disk)
        const defaultPath = path.join(__dirname, 'defaults', fileName);
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
function readConfigWithFallback(fileName) {
    const deployedPath = path.join(DEPLOY_DIR, fileName);
    const defaultPath = path.join(__dirname, 'defaults', fileName); // Defaults stay local

    if (fs.existsSync(deployedPath)) {
        try {
            return JSON.parse(fs.readFileSync(deployedPath, 'utf-8'));
        } catch (err) {
            console.error(`Error reading deployed ${fileName}:`, err);
        }
    }

    if (fs.existsSync(defaultPath)) {
        try {
            return JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
        } catch (err) {
            console.error(`Error reading default ${fileName}:`, err);
        }
    }

    return {};
}

// GET endpoint to fetch all configs with fallback
app.get('/api/configs', (req, res) => {
    try {
        const configs = {};

        CONFIG_FILES.forEach(fileName => {
            configs[fileName] = readConfigWithFallback(fileName);
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

// Validate Token Route
app.get('/api/validate-token', authenticateJWT, (req, res) => {
    // If we reach here, authenticateJWT middleware has already verified the token
    res.json({ valid: true, user: req.user });
});

app.post('/api/deploy', authenticateJWT, (req, res) => {
    const { files } = req.body;

    if (!files) {
        return res.status(400).json({ error: 'No files provided' });
    }

    try {
        console.log('📥 Received files from client:', Object.keys(files));
        console.log('💾 Deployment directory:', DEPLOY_DIR);
        console.log('📊 Current files in deploy dir:',
            fs.existsSync(DEPLOY_DIR) ? fs.readdirSync(DEPLOY_DIR) : 'dir does not exist yet');

        // Clear existing files (except expected JSONs)
        if (fs.existsSync(DEPLOY_DIR)) {
            fs.readdirSync(DEPLOY_DIR).forEach(file => {
                if (!CONFIG_FILES.includes(file)) {
                    fs.unlinkSync(path.join(DEPLOY_DIR, file));
                }
            });
        }

        // Write files to the persistent storage
        console.log('Deploying files to:', DEPLOY_DIR);

        // Only deploy expected JSON files
        const validFiles = {};
        CONFIG_FILES.forEach(fileName => {
            if (files[fileName]) {
                validFiles[fileName] = files[fileName];
                console.log(`✅ ${fileName}: ${Object.keys(files[fileName]).length} keys`);
            } else {
                console.log(`⚠️ Warning: Missing file: ${fileName}`);
            }
        });

        Object.entries(validFiles).forEach(([fileName, content]) => {
            const filePath = path.join(DEPLOY_DIR, fileName);
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
            console.log(`✅ Saved ${fileName} with ${Object.keys(content).length} keys`);
        });

        console.log('✅ Deployment completed successfully');
        res.json({ message: 'Deployment successful' });

    } catch (error) {
        console.error('❌ Deployment failed:', error);
        res.status(500).json({ error: `Deployment failed: ${error.message}` });
    }
});

// API endpoints to serve config files
// GET /api/config/:filename - fetch from deployed configs (with fallback to defaults)
app.get('/api/config/:filename', (req, res) => {
    const { filename } = req.params;

    // Security: only allow known config files
    if (!CONFIG_FILES.includes(filename)) {
        return res.status(400).json({ error: 'Invalid config file' });
    }

    try {
        const deployedPath = path.join(DEPLOY_DIR, filename);
        const defaultPath = path.join(__dirname, 'defaults', filename);

        // Prefer deployed config, fallback to default
        if (fs.existsSync(deployedPath)) {
            const content = fs.readFileSync(deployedPath, 'utf-8');
            res.type('application/json').send(content);
        } else if (fs.existsSync(defaultPath)) {
            const content = fs.readFileSync(defaultPath, 'utf-8');
            res.type('application/json').send(content);
        } else {
            return res.status(404).json({ error: `Config file not found: ${filename}` });
        }
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
        const defaultPath = path.join(__dirname, 'defaults', filename);

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

// GET /api/deployed/:filename - fetch from deployed configs only (no fallback)
app.get('/api/deployed/:filename', (req, res) => {
    const { filename } = req.params;

    // Security: only allow known config files
    if (!CONFIG_FILES.includes(filename)) {
        return res.status(400).json({ error: 'Invalid config file' });
    }

    try {
        const deployedPath = path.join(DEPLOY_DIR, filename);

        if (fs.existsSync(deployedPath)) {
            const content = fs.readFileSync(deployedPath, 'utf-8');
            res.type('application/json').send(content);
        } else {
            return res.status(404).json({ error: `Deployed config not found: ${filename}` });
        }
    } catch (error) {
        console.error(`Error fetching deployed config ${filename}:`, error);
        res.status(500).json({ error: `Failed to fetch deployed config: ${error.message}` });
    }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        elapsed: Date.now(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        disk: USE_MOUNTED_VOLUME ? 'persistent' : 'ephemeral',
        basePath: BASE_PATH,
        deployDirExists: fs.existsSync(DEPLOY_DIR)
    };
    res.json(health);
});

// Serve built React frontend (production Docker build copies client/dist → public/)
const PUBLIC_DIR = path.join(__dirname, 'public');
if (fs.existsSync(PUBLIC_DIR)) {
    app.use(express.static(PUBLIC_DIR));
    // Catch-all: let React Router handle client-side routes
    app.get('{*path}', (req, res) => {
        res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`\n=== SERVER STARTED ===`);
    console.log(`🚀 HTTP Server running on http://localhost:${PORT}`);
    console.log(`💾 Storage mode: ${USE_MOUNTED_VOLUME ? 'Render Disk (persistent)' : 'Local filesystem (ephemeral)'}`);
    console.log(`📁 Base path: ${BASE_PATH}`);
    console.log(`🔑 Health check: http://localhost:${PORT}/health`);
    console.log(`====================\n`);
});
