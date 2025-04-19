#!/bin/bash

# Create necessary directories
mkdir -p frontend/src backend/src nginx prometheus

# Install dependencies
echo "Installing dependencies..."

# Frontend dependencies
cd frontend
npm init -y
npm install react react-dom @mui/material @emotion/react @emotion/styled axios react-router-dom @reduxjs/toolkit react-redux

# Backend dependencies
cd ../backend
npm init -y
npm install express mongoose redis jsonwebtoken bcryptjs cors helmet express-rate-limit express-validator dotenv winston

# Development dependencies
npm install --save-dev typescript @types/node @types/express @types/mongoose @types/redis @types/jsonwebtoken @types/bcryptjs @types/cors jest @types/jest ts-jest nodemon

# Create TypeScript configuration
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
EOL

# Create environment files
cd ..

# Frontend environment
cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
EOL

# Backend environment
cat > backend/.env << EOL
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://mongodb:27017/ai_platform
REDIS_URL=redis://redis:6379
JWT_SECRET=your_jwt_secret_here
EOL

# Create basic frontend structure
cd frontend/src
mkdir -p components pages services utils hooks store

# Create basic backend structure
cd ../../backend/src
mkdir -p controllers models routes services utils middleware config

# Create Docker network
docker network create ai-platform-network

# Build and start containers
cd ../..
docker-compose up --build -d

echo "Development environment setup complete!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001" 