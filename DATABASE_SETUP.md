# Database-Backed Config Manager - Deployment Guide

## Overview

The Config Manager now uses **PostgreSQL database** to persist deployed configurations. This means configs survive:
- ✅ Service restarts on Render.com
- ✅ Inactivity timeouts
- ✅ Application deployments
- ✅ Server crashes

## Quick Start

### Local Development (No Database)

If you want to work locally without PostgreSQL:

```bash
cd server
npm install
node server.js
```

The app will:
- Work with filesystem-based configs (`deployed_configs/` directory)
- Show a warning that DATABASE_URL is not set
- All features work normally, configs persist only in local filesystem

### Local Development (With PostgreSQL)

1. **Install PostgreSQL locally** (macOS with Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

2. **Create a database**:
```bash
createdb config_manager
```

3. **Set DATABASE_URL in `.env`**:
```env
DATABASE_URL=postgresql://localhost/config_manager
PORT=3000
JWT_SECRET=dev-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$wMH58x6AUTUQbaH309oA3.HFLEoZZnSNevS0wx1AE8GYiOz5V6PiK
```

4. **Start the server**:
```bash
cd server
npm start
# or: node server.js
```

The server will:
- Create the `deployed_configs` table automatically
- Seed it with configs from `defaults/` directory on first run
- Store all future deployments in the database

5. **Verify the setup**:
```bash
curl http://localhost:3000/api/status
```

You should see:
```json
{
  "status": "ok",
  "database": {
    "status": "connected",
    "isDatabaseAvailable": true,
    "configCount": 5
  }
}
```

## Render.com Production Deployment

### Prerequisites
- Config Manager source code pushed to GitHub/GitLab
- Render.com account

### Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `config-manager-db`
   - **Region**: Choose closest to your users (same as web service)
   - **Database**: `config_manager`
   - **User**: `config_manager` (auto-generated)
4. Click **"Create Database"**
5. Wait for database to be created (2-3 minutes)
6. **Copy the Internal Database URL** (looks like):
   ```
   postgresql://user:password@dpg-example.postgres.render.com/config_manager
   ```

### Step 2: Deploy Web Service with Database

#### Option A: If you already have a web service on Render

1. Go to your web service settings
2. **Environment** tab
3. Add these environment variables:
   ```
   DATABASE_URL=postgresql://user:password@dpg-example.postgres.render.com/config_manager
   JWT_SECRET=<generate-a-strong-secret>
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=<your-bcrypt-hash>
   PORT=3000
   ```
4. Save and manually deploy

#### Option B: If creating a new web service

1. **New +"** → **"Web Service"**
2. Select your GitHub repo
3. Configure:
   - **Name**: `config-manager`
   - **Environment**: `Node`
   - **Build command**: `cd server && npm install`
   - **Start command**: `node server/server.js`
   - **Region**: Same as database
4. **Click "Advanced"** → **"Environment"**
5. Add variables (use Internal Database URL from Step 1):
   ```
   DATABASE_URL=postgresql://user:password@dpg-example.postgres.render.com/config_manager
   JWT_SECRET=your-secret-key-here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=<bcrypt-hash>
   PORT=3000
   ```
6. Deploy

### Step 3: Verify Deployment

Once deployed to Render:

1. **Check health endpoint**:
```bash
curl https://your-app.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "isDatabaseAvailable": true,
    "configCount": 5
  }
}
```

2. **Check status endpoint**:
```bash
curl https://your-app.onrender.com/api/status
```

3. **Log in and deploy a config** via the web UI
4. **Wait 5+ minutes** then check if config persists (simulating inactivity timeout)

## Changing Admin Password

To change the admin password:

```bash
cd server
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('new_password', 10).then(hash => console.log(hash));"
```

This will output a bcrypt hash. Update the `ADMIN_PASSWORD_HASH` environment variable:

**Local development**: Update `.env`
**Render.com**: Update in Environment variables

Then restart the service.

## Monitoring & Troubleshooting

### Check Database Connection Status

```bash
curl https://your-app.onrender.com/api/status
```

Response with connected database:
```json
{
  "database": {
    "status": "connected",
    "isDatabaseAvailable": true,
    "configCount": 5,
    "maxConnections": 20,
    "activeConnections": 1
  }
}
```

### Common Issues

#### "Error: connect ECONNREFUSED" or database connection fails

**Solution**: 
- Verify DATABASE_URL is correctly set in environment
- For Render, use **Internal Database URL**, not External URL
- Make sure web service can reach database (should be in same region)
- Check Render dashboard for database service status

#### "Database pool not initialized"

**Solution**:
- DATABASE_URL is not set (app falls back to filesystem)
- This is OK for local development, but you need it on Render
- Add DATABASE_URL to Render environment variables

#### Configs disappear after service restart

**Solution**:
- This indicates DATABASE_URL is not properly set
- Verify with `/api/status` endpoint
- Add DATABASE_URL to environment and redeploy

### Viewing Database Contents

#### Via Render Dashboard

1. Go to your PostgreSQL service on Render
2. Click **"Connect"** → **"PSQL"**
3. Run queries:

```sql
-- Check configs in database
SELECT config_key, updated_at FROM deployed_configs ORDER BY updated_at DESC;

-- Check specific config
SELECT config_data FROM deployed_configs WHERE config_key = 'theme.json';

-- Count configs
SELECT COUNT(*) FROM deployed_configs;
```

#### Via pgAdmin (Optional)

For more powerful database management:

1. Deploy pgAdmin on Render (free tier available)
2. Add connection to your config-manager database
3. Browse tables and run queries visually

## Backup & Recovery

### Backup Configs from Database

```bash
# Export to JSON file
pg_dump --data-only \
  postgresql://user:password@host/config_manager \
  -t deployed_configs > backup.sql

# Or manually via UI - download each config file
```

### Restore Configs

```bash
# Restore from backup
psql postgresql://user:password@host/config_manager < backup.sql
```

### Reset to Defaults

If you need to reset all configs to defaults:

```sql
DELETE FROM deployed_configs;
-- App will reload defaults from defaults/ directory on next startup
```

## Performance & Scaling

### Connection Pool Settings

Current defaults in `db.js`:
- **Max connections**: 20
- **Idle timeout**: 30 seconds
- **Connection timeout**: 2 seconds

These are suitable for most deployments. For high-traffic scenarios, increase `max` in `db.js`.

### Database Query Performance

- Indexes on `config_key` for fast lookups
- JSONB storage allows future filtering/querying
- No N+1 queries (uses batch operations)

## Migration from Filesystem Storage

If you had the old filesystem-based version:

1. Your old configs in `deployed_configs/` won't automatically migrate
2. On first startup with DATABASE_URL set, defaults load into database
3. To use existing configs:
   - Copy them to the `defaults/` directory (they'll seed into database)
   - Or manually insert via the web UI (deploy endpoint)

## What Happens Without DATABASE_URL

If DATABASE_URL is not set:

- ✅ App still works
- ✅ Configs stored in local filesystem (`deployed_configs/`)
- ❌ Configs lost on service restart (on Render)
- ❌ Inactivity timeouts cause data loss

**This mode is only suitable for local development.**

## Production Checklist

- [ ] PostgreSQL database created on Render
- [ ] DATABASE_URL set in environment variables
- [ ] JWT_SECRET changed from default
- [ ] ADMIN_PASSWORD_HASH updated (or left as-is with bcrypt hash)
- [ ] Test deployment via web UI
- [ ] Verify with `/api/status` endpoint
- [ ] Monitor logs for errors
- [ ] Set up backup/restore process if needed
- [ ] Document admin credentials securely

## Questions?

For issues or questions about the database setup, check:
- Server logs: Render dashboard → Logs tab
- Database status: `/api/status` endpoint
- Database health: `/health` endpoint
