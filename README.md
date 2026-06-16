# Config Manager

A full-stack application for managing configurations, featuring a React-based frontend and an Express Node.js backend.

## Tech Stack

### Frontend (Client)
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React (Icons)
- React Markdown

### Backend (Server)
- Node.js
- Express
- JSON Web Tokens (JWT) for Authentication
- bcryptjs for password hashing
- PostgreSQL (optional but recommended for persistent config storage on Render.com)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

## Environment Variables

The server directory includes a `.env` file with pre-configured settings:

```env
JWT_SECRET=super-secret-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...
PORT=3000
DATABASE_URL=postgresql://... # Optional: For persistent config storage
```

**Login Credentials:** The default credentials are `admin` / `password` (bcrypt hashed). These will work immediately after installation and persist after deployment.

**⚠️ Security Note:** For production deployments, change the `JWT_SECRET` to a unique value to ensure secure token generation.

**📊 Database Configuration (Recommended for Production):**
For production deployments on Render.com or other platforms, configure `DATABASE_URL` to persist configs across service restarts:
- See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed PostgreSQL setup instructions
- Without DATABASE_URL, configs are stored in the local filesystem and will be lost on service restarts (on Render.com)
- Local development works fine without a database

To change credentials:
1. Generate a new bcrypt hash:
   ```bash
   cd server
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('new_password', 10).then(hash => console.log(hash));"
   ```
2. Update the `.env` file with your new `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`

## Installation

1. Clone the repository and navigate into the project root:
   ```bash
   git clone <repository-url>
   cd config-manager
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```

4. The `.env` file is already included in the repository with default credentials.

## Running the Application

A convenient `start.sh` script is provided in the root directory to start both the client and server concurrently.

1. Make sure the script is executable:
   ```bash
   chmod +x start.sh
   ```

2. Run the script:
   ```bash
   ./start.sh
   ```

This will:
- Stop any existing node processes running on ports 3000 and 5173.
- Start the Express server on `http://localhost:3000`.
- Start the Vite React development server on `http://localhost:5173`.

### Running Manually

To run the server manually:
```bash
cd server
node server.js
```

To run the client manually:
```bash
cd client
npm run dev
```

## Project Structure

```
config-manager/
├── client/                 # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Frontend source code
│   └── package.json        # Frontend dependencies
├── server/                 # Express backend application
│   ├── certs/              # SSL Certificates
│   ├── deployed_configs/   # Dynamically deployed configurations
│   ├── .env                # Environment variables (includes login credentials)
│   ├── server.js           # Express server entry point
│   └── package.json        # Backend dependencies
├── start.sh                # Script to start both client and server
└── .gitignore              # Git ignore file for the root project
```

## Building for Production

To build the React application for production, navigate to the `client` directory and run:
```bash
cd client
npm run build
```
The optimized production build will be available in the `client/dist` directory.

## Production Deployment

### Server Setup

1. Build the frontend:
   ```bash
   cd client && npm run build
   ```

2. The `.env` file with pre-configured credentials is included in the repository - just deploy it with the server. **Important:** Change `JWT_SECRET` to a unique value for production.

3. Start the server:
   ```bash
   cd server
   node server.js
   ```

4. Serve the built frontend using a reverse proxy (e.g., Nginx) or use the client as a static build served by the Express server.

### Docker Deployment (Optional)

Create a `Dockerfile` in the root:
```dockerfile
FROM node:18

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN cd server && npm install
RUN cd client && npm install

# Build frontend
RUN cd client && npm run build

# Copy server code and built frontend
COPY server/ ./server/
COPY client/dist ./server/public

WORKDIR /app/server
EXPOSE 3000

CMD ["node", "server.js"]
```

### Static Login Persistence

The `.env` file is included in the repository, so credentials will persist across deployments. The password is bcrypt-hashed for security.
