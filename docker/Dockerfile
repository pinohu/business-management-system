# Use Node.js LTS version
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Install global dependencies
RUN npm install -g \
    typescript \
    ts-node \
    nodemon \
    prisma

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose development port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"] 