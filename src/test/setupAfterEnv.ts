import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods
console.error = jest.fn();
console.warn = jest.fn();
console.log = jest.fn();

// Mock process.env
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://user:password@localhost:5432/business_management_test',
  JWT_SECRET: 'test_jwt_secret',
  PORT: '3000',
};

// Mock Date
const mockDate = new Date('2023-01-01T00:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => arr.fill(0),
    subtle: {
      digest: () => Promise.resolve(new ArrayBuffer(32)),
    },
  },
});
