# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libreoffice \
    tesseract-ocr \
    tesseract-ocr-data-eng

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    libreoffice \
    tesseract-ocr \
    tesseract-ocr-data-eng

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create necessary directories
RUN mkdir -p ./logs ./uploads ./models

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
