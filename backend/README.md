# Business Management System Backend

A robust backend service for managing business operations, built with NestJS, PostgreSQL, and Prisma.

## Features

- User authentication and authorization
- Project management
- Expense tracking
- Tax estimation
- Secure API endpoints
- Rate limiting and security headers
- Request logging
- Docker support
- CI/CD pipeline

## Prerequisites

- Node.js 18 or later
- PostgreSQL 15 or later
- Docker and Docker Compose (optional)

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run start:dev
```

## Docker Development

1. Build and start containers:
```bash
docker-compose up -d
```

2. Run database migrations:
```bash
docker-compose exec app npx prisma migrate dev
```

## Production Deployment

1. Build the Docker image:
```bash
docker build -t business-management-backend .
```

2. Run the container:
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="your-production-database-url" \
  -e JWT_SECRET="your-production-jwt-secret" \
  -e JWT_EXPIRATION="1d" \
  -e FRONTEND_URL="your-production-frontend-url" \
  -e NODE_ENV="production" \
  business-management-backend
```

## API Documentation

The API documentation is available at `/api` when running the server in development mode.

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:cov
```

## CI/CD

The project includes a GitHub Actions workflow for continuous integration and deployment. The workflow:
- Runs tests on pull requests
- Builds and tests on main branch pushes
- Deploys to production on successful main branch pushes

## Security

- JWT-based authentication
- Rate limiting
- Security headers
- Request logging
- Input validation
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the UNLICENSED License.
