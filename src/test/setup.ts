import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Load environment variables
config();

// Create a mock Prisma client
export const prismaMock = mockDeep<PrismaClient>();

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/business_management_test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.PORT = '3000';

// Global test setup
beforeAll(async () => {
  // Add any global setup here
});

// Global test teardown
afterAll(async () => {
  // Add any global teardown here
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Export types
export type PrismaMock = DeepMockProxy<PrismaClient>;
