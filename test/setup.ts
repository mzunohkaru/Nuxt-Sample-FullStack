import { vi } from "vitest";

// Mock Nuxt functions
global.defineEventHandler = vi.fn((handler) => handler);
global.getMethod = vi.fn();
global.createError = vi.fn();

// Mock console methods to suppress logs during tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
};
