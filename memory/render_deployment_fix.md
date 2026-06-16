---  
name: render-deployment-fix
description: Config Manager resets configs on Render due to ephemeral filesystem
metadata:
  type: project
---  

**Problem:** Config Manager deployed on Render.com resets deployed configs when:
- Service restarts (inactivity, crashes, updates)
- Render's ephemeral filesystem wipes changes
- The `server/deployed_configs/` directory is excluded from git via .gitignore

**Root Cause:** 
- `server/deployed_configs/` is in .gitignore, so not committed to git
- Render doesn't match this directory structure when rebuilding
- File system resets to clean state on restart

**Solution Implemented:**

1. **Created files:
   - `server/server.render.js` - Render-optimized version with persistent disk support
   - `server/Dockerfile.render` - Production-ready Dockerfile for Render Disk
   - `server/README_RENDER.md` - Complete Render deployment guide
   - `QUICKFIX_RENDER.md` - Quick start documentation

2. **Recommended approach:** Use Render Disk (persistent storage):
   ```bash
   # Steps to implement:
   1. Update .env in Render dashboard with:
      USE_MOUNTED_VOLUME=true
   2. Create and attach Render Disk at /mnt/data
   3. Replace server/server.js with server/server.render.js
   4. Redeploy service
   ```

**Alternative simpler solution:** Remove `server/deployed_configs/` from .gitignore and commit configs.

**Files affected:**
- `server/.env` - still contains local dev settings, not an issue
- `server/deployed_configs/` - currently contains production-style config files that will be persisted via Render Disk or git commits

**User confirmed this request is about:** Deployment on render.com resetting configs on inactivity

**Key insight:** The core issue is combining `gitignore` exclusion + ephemeral deployment platform = lost configs.

***How to apply:*** Follow the QUICKFIX_RENDER.md guide for step-by-step implementation. Recommend starting with Option 2 (git-committed) for simplicity, then migrate to disk later as needed.