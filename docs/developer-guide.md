# Developer Guide

## Project Structure

```
business-management/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── test/            # Test files
├── prisma/              # Prisma schema and migrations
├── docs/                # Documentation
├── scripts/             # Utility scripts
└── docker/              # Docker configuration
```

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- PostgreSQL >= 13.0
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/business-management.git
   cd business-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Set up the database:
   ```bash
   npm run prisma:migrate
   ```

5. Start development services:
   ```bash
   # Start Apache Tika Server
   java -jar tika-server-standard-2.4.1.jar

   # Start Matomo
   docker-compose -f docker-compose.matomo.yml up -d

   # Start Prometheus
   docker-compose -f docker-compose.prometheus.yml up -d
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture

### Backend

The backend is built using:
- Express.js for the web server
- Prisma for database access
- JWT for authentication
- OpenTelemetry for observability
- Matomo for analytics
- Prometheus for monitoring

### Frontend

The frontend is built using:
- React with TypeScript
- Vite for building
- Zustand for state management
- Axios for API calls
- Tailwind CSS for styling

## Development Workflow

### Branching Strategy

1. Create feature branches from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make changes and commit:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. Push changes:
   ```bash
   git push origin feature/your-feature
   ```

4. Create a pull request to `main`

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Document complex logic

### Testing

1. Write unit tests:
   ```bash
   npm test
   ```

2. Run integration tests:
   ```bash
   npm run test:integration
   ```

3. Check test coverage:
   ```bash
   npm run test:coverage
   ```

## API Development

### Adding New Endpoints

1. Create a new route file in `src/routes/`
2. Add controller in `src/controllers/`
3. Add service in `src/services/`
4. Add validation middleware
5. Write tests
6. Update API documentation

### Error Handling

Use the error handler middleware:
```typescript
throw new AppError('Error message', 'ERROR_CODE', 400);
```

### Authentication

Use the auth middleware:
```typescript
router.use(authMiddleware);
```

## Database

### Schema Changes

1. Update Prisma schema
2. Generate migration:
   ```bash
   npm run prisma:migrate
   ```
3. Apply migration:
   ```bash
   npm run prisma:migrate:deploy
   ```

### Seeding Data

1. Update seed file
2. Run seed:
   ```bash
   npm run prisma:seed
   ```

## Deployment

### Building

1. Build the application:
   ```bash
   npm run build
   ```

2. Build Docker image:
   ```bash
   docker build -t business-management .
   ```

### Deployment Steps

1. Update version in `package.json`
2. Create release branch
3. Run tests
4. Build application
5. Deploy to staging
6. Verify staging
7. Deploy to production

## Monitoring

### Logging

Use the logger:
```typescript
import { logger } from '../utils/logger';

logger.info('Message');
logger.error('Error', { error });
```

### Metrics

Add custom metrics:
```typescript
import { metrics } from '../utils/metrics';

metrics.counter.inc();
metrics.gauge.set(value);
metrics.histogram.observe(value);
```

## Security

### Best Practices

1. Use environment variables
2. Validate all input
3. Sanitize output
4. Use prepared statements
5. Implement rate limiting
6. Use HTTPS
7. Regular security audits

### Common Vulnerabilities

1. SQL Injection
2. XSS Attacks
3. CSRF Attacks
4. Authentication Bypass
5. Information Disclosure

## Performance

### Optimization

1. Use caching
2. Implement pagination
3. Optimize database queries
4. Use compression
5. Implement lazy loading
6. Monitor memory usage
7. Profile application

### Monitoring

1. Use Prometheus metrics
2. Set up Grafana dashboards
3. Monitor error rates
4. Track response times
5. Monitor resource usage
