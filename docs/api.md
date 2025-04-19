# API Documentation

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Users

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/users/profile
```

#### Update User Profile
```http
PUT /api/users/profile
Content-Type: application/json

{
  "name": "John Doe",
  "email": "newemail@example.com"
}
```

### Documents

#### Upload Document
```http
POST /api/documents/upload
Content-Type: multipart/form-data

file: <file>
title: "Document Title"
type: "pdf"
```

#### Get Document
```http
GET /api/documents/:id
```

#### List Documents
```http
GET /api/documents
Query Parameters:
  - page: number
  - limit: number
  - type: string
  - status: string
```

#### Process Document
```http
POST /api/documents/:id/process
Content-Type: application/json

{
  "options": {
    "extractText": true,
    "extractImages": true,
    "performOcr": true
  }
}
```

#### Delete Document
```http
DELETE /api/documents/:id
```

### Analytics

#### Get Analytics
```http
GET /api/analytics
Query Parameters:
  - startDate: string (ISO date)
  - endDate: string (ISO date)
  - metrics: string[] (comma-separated)
```

#### Get Document Analytics
```http
GET /api/analytics/documents/:id
Query Parameters:
  - startDate: string (ISO date)
  - endDate: string (ISO date)
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

Common error codes:
- `INVALID_CREDENTIALS`: Invalid email or password
- `UNAUTHORIZED`: Missing or invalid authentication token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1625097600
```

## Pagination

List endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## WebSocket Events

The API provides WebSocket connections for real-time updates:

```javascript
const ws = new WebSocket('ws://api.example.com/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle event
};
```

Available events:
- `document.processing`: Document processing status updates
- `document.completed`: Document processing completed
- `document.failed`: Document processing failed
- `analytics.update`: Real-time analytics updates
