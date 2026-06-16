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

# Copy built React app (if present) - for production this should be copied during CI/Deployment
COPY ./public ./public || true

# Ensure required directories exist (these will hold config files)
RUN mkdir -p config deployed_configs defaults

# Server runs on port 3000 by default
EXPOSE 3000

# Create .env file with required environment variables
# These are required for deployment on Render and should be configured in their dashboard:
# JWT_SECRET - Secret for JWT token generation
# ADMIN_USERNAME - Username for admin access
# ADMIN_PASSWORD_HASH - Hashed password (bcrypt)
# USE_MOUNTED_VOLUME - Set to 'true' to use Render Disk for persistent storage
RUN echo "PORT=3000" > .env

# Start command
CMD ["node", "server.js"]