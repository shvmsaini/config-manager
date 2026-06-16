# 🔧 Quick Fix for Render.com Deployment Issue

## ❌ Problem
Your configs are being reset on Render.com because the file system is **ephemeral** by default. When the service restarts, the `server/deployed_configs/` directory contents are lost.

## ✅ Solution Options

### Option 1: Render Disk (Recommended - Keeps Current Architecture)

#### What it does:
- Attaches a persistent 1GB disk to your Render service
- Configs stored on disk survive restarts and deployments
- Maintains your current API architecture

#### Steps:

1. **Create a Render Disk** (one-time setup):
   - Go to Render dashboard → Your Service → Disks
   - Click "Create Disk"
   - Name: `config-data`
   - Size: 1GB (minimum for config files)

2. **Attach the disk to your service**:
   - Go to your web service settings
   - Scroll to "Disks" section
   - Click "Attach Disk"
   - Select disk: `config-data`
   - Mount path: `/mnt/data`

3. **Update your service environment variables**:
   ```
   USE_MOUNTED_VOLUME=true
   JWT_SECRET=<your-secret>
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=<your-bcrypt-hash>
   PORT=3000
   ```

4. **Update your files**:
   ```bash
   # Replace your current server.js with the Render-safe version
   cp server/server.render.js server/server.js

   # Or update the existing server.js to use environment-based paths
   ```

5. **Redeploy**:
   - Push to the branch connected to Render
   - Or trigger a manual deploy from Render dashboard

#### Health Check:
After deployment, visit `https://your-app.onrender.com/health` to verify:
```json
{
  "status": "healthy",
  "disk": "persistent",
  "basePath": "/mnt/data",
  "deployDirExists": true
}
```

---

### Option 2: Git-Committed Configs (Simplest - No Disk Needed)

#### What it does:
- Removes `server/deployed_configs/` from `.gitignore`
- Commits your configs to git so they're always deployed
- Simpler but configs must be updated via git commits

#### Steps:

1. **Remove from .gitignore**:
   ```bash
   # Edit .gitignore and delete or comment out:
   # server/deployed_configs/
   ```

2. **Commit your current configs**:
   ```bash
   git add server/deployed_configs/
   git commit -m "Save deployed configs to git for Render persistence"
   git push
   ```

3. **No Render Disk needed** - git handles persistence

#### Trade-offs:
- ❓ Config updates require git commits/deployments (not dynamic)
- ✅ No additional Render setup (no disk needed)
- ✅ Simpler architecture

---

### Option 3: Environment Variables (Most Robust - No Filesystem)

#### What it does:
- Moves config storage to Render environment variables
- No filesystem dependency at all
- Most reliable but requires more setup

#### Steps:

1. **Convert configs to JSON strings** and add to Render environment:
   ```bash
   # For each config file, minify to one line then add as env var:
   # Example: WIDGETS_CONFIG={"widgets":{...},...}
   # Example: THEME_CONFIG={"primary":"#007AFF",...}
   ```

2. **Update server.js** to read from environment on startup:

```javascript
// In server.js, read configs from environment variables
const loadConfig = (envVarName, defaultFileName) => {
    const configFromEnv = process.env[envVarName];
    if (configFromEnv) {
        try {
            return JSON.parse(configFromEnv);
        } catch (e) {
            console.error(`Failed to parse ${envVarName}:`, e);
        }
    }
    // Fallback to file if env var not set
    return readConfigWithFallback(defaultFileName);
};

// Then use in /api/configs endpoint
const configs = {
    'widgets.json': loadConfig('WIDGETS_CONFIG', 'widgets.json'),
    'theme.json': loadConfig('THEME_CONFIG', 'theme.json'),
    // ... etc
};
```

3. **Set up environment variables in Render**:
   - Use Render dashboard → Service → Environment
   - Add variables for each config file

---

## 🎯 Which Option Should You Choose?

| Feature | Option 1 (Disk) | Option 2 (Git) | Option 3 (Env Vars) |
|---------|----------------|----------------|---------------------|
| **Runtime config updates** | ✅ | ❌ | ❌ |
| **Complexity** | Medium | Low | High |
| **Render bill impact** | +$0.25/month | None | None |
| **Setup time** | 10 min | 2 min | 30 min |
| **Works on inactivity** | ✅ | ✅ | ✅ |

**My recommendation:**
- **Option 1** if you need runtime config updates without redeploying
- **Option 2** if you're okay with git-based config management (simplest for small teams)

## 🧪 Testing Locally

Before deploying to Render, test Option 1 locally:

```bash
# Simulate Render Disk environment
cd server
USE_MOUNTED_VOLUME=true node server.js
```

This will simulate the disk behavior before deploying.

## 📞 Need More Help?

If you're still having issues:
1. Check Render dashboard logs for mount errors
2. Verify disk is attached correctly: Settings → Disks
3. Ensure `USE_MOUNTED_VOLUME=true` is set in Render environment
4. Test with the health endpoint to confirm disk is mounted
