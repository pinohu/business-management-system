import { createSwaggerSpec } from 'next-swagger-doc';
import { NextResponse } from 'next/server';

const apiConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Freelance Dashboard API',
    version: '1.0.0',
    description: 'API documentation for the Freelance Dashboard application',
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      description: 'API server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export async function GET() {
  const spec = createSwaggerSpec({
    definition: apiConfig,
    apiFolder: 'src/app/api',
  });

  return NextResponse.json(spec);
} 