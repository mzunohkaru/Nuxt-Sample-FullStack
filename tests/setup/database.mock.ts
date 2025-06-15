import { vi } from 'vitest';

// It's crucial to hoist the mock setup so it runs before the actual module is imported anywhere.
// The path to the module being mocked must be correct relative to the project root
// or how it's resolved by Vitest/Nuxt.
// Assuming '~/server/database' resolves correctly due to aliases in vitest.config.ts
// or if not, use a relative path from the project root e.g., './server/database'

// Define a type for our mock Prisma client to ensure type safety
interface MockPrismaUser {
  findMany: ReturnType<typeof vi.fn>;
  // Add other methods like findUnique, create, update, delete as needed
}

interface MockPrismaClient {
  user: MockPrismaUser;
  // Add other models like post, comment as needed
}

// Create the mock Prisma client object
export const mockPrisma: MockPrismaClient = {
  user: {
    findMany: vi.fn(),
    // Initialize other user methods here, e.g., findUnique: vi.fn(),
  },
  // Initialize other models here
};

// Perform the actual mock
// The path here must exactly match how 'server/database/index.ts' is imported in the application code.
// If it's imported as '~/server/database', this path should be '~/server/database'.
// If it's imported with a relative path from a file like './../../database', that's harder to globally mock.
// Using an alias in vitest.config.ts for '~/server/database' that points to 'server/database/index.ts' is often best.
// For now, let's assume the alias '~/server' is set up and we can use '~/server/database'.
// If not, this path might need to be './server/database/index.ts' (relative from project root)
// or adjusted based on how Vitest resolves it.

vi.mock('~/server/database', () => ({
  prisma: mockPrisma,
}));

// Example of how to use and reset mocks in tests (optional, for documentation):
// beforeEach(() => {
//   mockPrisma.user.findMany.mockReset();
//   // Reset other mocks
// });

// mockPrisma.user.findMany.mockResolvedValue([{ id: 1, name: 'Test User', email: 'test@example.com' }]);
