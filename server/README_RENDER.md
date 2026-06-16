# Render.com Deployment Guide

## Understanding the Issue

Render.com uses ephemeral file systems by default - the `deployed_configs/` directory gets reset when:
- Service restarts
- Inactivity timeout
- Deployment updates

## Solution 1: Using Render Disk (Recommended)

### Step 1: Create a Render Disk
1. Go to your Render service dashboard
2. Click on "Disks" in the sidebar
3. Click "Create Disk"
4. Name it `config-manager-data`
5. Give it 1GB (minimum for our needs)
6. Leave all other settings default and create

### Step 2: Mount the Disk in Your Service
1. Go to your web service settings
2. Scroll to "Disks" section
3. Click "Attach Disk"
4. Select the disk you just created
5. Set mount path to `/mnt/data`

### Step 3: Update Dockerfile
Update your Dockerfile to look like this:

```dockerfile
# Use Node.js LTS as the base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Copy built React app (if present)
COPY ./public ./public || true

# Ensure required directories exist in the mounted volume location
RUN mkdir -p /mnt/data/deployed_configs /mnt/data/defaults /mnt/data/configs

# Create symlinks so the app can find configs in mounted volume
RUN ln -s /mnt/data/deployed_configs /usr/src/app/deployed_configs \
    && ln -s /mnt/data/defaults /usr/src/app/defaults \
    && ln -s /mnt/data/configs /usr/src/app/configs

# Server runs on port 3000 by default
EXPOSE 3000

# Create .env file with required environment variables
RUN echo "PORT=3000" > .env

# Start command
CMD ["node", "server.js"]
```

### Step 4: Update server.js
Modify the directory paths in your `server.js` to work with the new structure:

```javascript
// Update these lines to use environment variables for paths
const USE_MOUNTED_VOLUME = process.env.USE_MOUNTED_VOLUME === 'true';

const getPath = (dir) => {
    return USE_MOUNTED_VOLUME 
        ? path.join('/mnt', 'data', dir)
        : path.join(__dirname, dir);
};

const DEPLOY_DIR = getPath('deployed_configs');
const DEFAULT_DIR = getPath('defaults');
const CONFIG_DIR = getPath('configs');
```

### Step 5: Redeploy
1. Update your Render service environment variables:
   - Add `USE_MOUNTED_VOLUME=true`
   - Make sure `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` are set
2. Redeploy your service

## Solution 2: Simpler Git-Committed Approach

If you don't need dynamic runtime config updates, simply remove `server/deployed_configs/` from `.gitignore`:

```bash
# In your .gitignore file, delete or comment out this line:
# server/deployed_configs/
```

Then commit your deployed configs:

```bash
git add server/deployed_configs/
git commit -m "Add deployed configs to git for Render persistence"
git push
```

For more flexibility, you can use branches:
- `production` branch with production configs
- `development` branch with dev configs

## Solution 3: Hybrid Approach

Store production configs as environment variables in Render dashboard:

1. Convert your JSON configs to environment variables
2. Parse them on startup in `server.js`
3. Write them to the ephemeral filesystem

## Troubleshooting

- **Right after deployment**, configs might not persist until the disk is mounted
- **Check Render logs** for mount errors
- **Verify disk attachment** in service settings
- **Filesystem permissions**: Ensure your app has write access to `/mnt/data`
