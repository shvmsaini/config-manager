# Stage 1: Build the React application
FROM node:18-alpine as builder

# Set working directory in container
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the React application
RUN npm run build

# Stage 2: Serve the built application using Nginix
FROM nginx:alpine

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginix
CMD ["nginx", "-g", "daemon off;"]