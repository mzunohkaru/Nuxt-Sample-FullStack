// This file is executed before each test file.
// Import the database mock to ensure Prisma is mocked for all tests.
import './database.mock'; // Adjust path if necessary, assuming it's in the same directory

// You can add other global setup actions here, for example:
// - Setting up global mocks for other utilities (e.g., Nuxt composables if not handled by environment)
// - Cleaning up global state before/after tests if necessary
// - vi.mock for other modules that need to be globally mocked

// Example: Mocking a global utility (if needed)
// import { vi } from 'vitest';
// vi.mock('some-global-utility', () => ({
//   someFunction: vi.fn(),
// }));

console.log('Vitest global setup: Prisma mock initialized.');

// If you need to reset mocks before each test, you can do it here,
// though it's often better to do it in beforeEach within the test files themselves
// for more granular control.
// import { mockPrisma } from './database.mock'; // If you need to access the mockPrisma object directly
// beforeEach(() => {
//   mockPrisma.user.findMany.mockReset();
//   // Reset other specific mocks if they were manipulated globally
// });
