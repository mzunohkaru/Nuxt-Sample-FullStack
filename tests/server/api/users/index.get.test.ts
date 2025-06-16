import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userGetHandler from '../../../../server/api/users/index.get'; // Adjust path based on actual file structure
import { mockPrisma } from '../../../setup/database.mock'; // Path to our mock
import type { H3Event } from 'h3';

// Mock Nuxt utilities
// These modules are part of Nuxt's auto-imports or H3 event context.
// We need to mock them globally or provide mock implementations.
const mockGetMethod = vi.fn();
const mockCreateError = vi.fn((err) => {
  const error = new Error(err.statusMessage || 'Error');
  (error as any).statusCode = err.statusCode;
  return error;
});

vi.mock('h3', async (importOriginal) => {
  const original = await importOriginal<typeof import('h3')>();
  return {
    ...original,
    getMethod: mockGetMethod,
    createError: mockCreateError,
    // defineEventHandler is not directly called by us, we import the handler itself.
    // If other h3 utilities used by the handler are needed, mock them here.
  };
});

describe('GET /api/users', () => {
  let mockEvent: Partial<H3Event>;

  beforeEach(() => {
    vi.resetAllMocks(); // Resets all mocks (including h3 and prisma)

    // Setup default mock event for h3
    mockEvent = {
      // Add any other event properties your handler might use
      // node: { req: {}, res: {} } as any, // If needed for deeper parts of h3 processing
    };

    // Reset NODE_ENV for predictable error 'details'
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore NODE_ENV if it was changed for a specific test
    delete process.env.NODE_ENV;
  });

  describe('Normal Cases', () => {
    it('should return a list of users with correct structure on GET request', async () => {
      mockGetMethod.mockReturnValue('GET');
      const usersFromDb = [
        { id: 1, name: 'Alice', email: 'alice@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Bob', email: 'bob@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockPrisma.user.findMany.mockResolvedValue(usersFromDb);

      const result = await userGetHandler(mockEvent as H3Event);

      expect(mockGetMethod).toHaveBeenCalledWith(mockEvent);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
      expect(result).toEqual({
        success: true,
        strings: ['Alice', 'Bob'],
        count: 2,
        timestamp: expect.any(String),
        message: 'ユーザーリストの取得に成功しました',
      });
      expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should return an empty list if no users are found', async () => {
      mockGetMethod.mockReturnValue('GET');
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await userGetHandler(mockEvent as H3Event);

      expect(result).toEqual({
        success: true,
        strings: [],
        count: 0,
        timestamp: expect.any(String),
        message: 'ユーザーリストの取得に成功しました',
      });
    });

    it('should correctly apply fallback logic for user strings', async () => {
      mockGetMethod.mockReturnValue('GET');
      const usersFromDb = [
        { id: 1, name: 'Alice', email: 'alice@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: null, email: 'bob@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 3, name: 'Charlie', email: null, createdAt: new Date(), updatedAt: new Date() }, // Assuming email can be null per schema if not explicitly required
        { id: 4, name: '', email: 'dave@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 5, name: 'Eve', email: '', createdAt: new Date(), updatedAt: new Date() },
        { id: 6, name: null, email: null, createdAt: new Date(), updatedAt: new Date() },
        { id: 7, name: '', email: '', createdAt: new Date(), updatedAt: new Date() },
      ];
      // Explicitly type the mock return value if Prisma types are strict
      mockPrisma.user.findMany.mockResolvedValue(usersFromDb.map(u => ({ ...u, name: u.name as string | null, email: u.email as string | null })) as any);


      const result = await userGetHandler(mockEvent as H3Event);

      expect(result.strings).toEqual([
        'Alice',
        'bob@example.com',
        'Charlie',
        'dave@example.com',
        'Eve',
        'User 6',
        'User 7',
      ]);
      expect(result.count).toBe(7);
    });
  });

  describe('Abnormal Cases', () => {
    it('should return 405 error if method is not GET', async () => {
      mockGetMethod.mockReturnValue('POST');

      // Check if createError is thrown
      await expect(userGetHandler(mockEvent as H3Event))
        .rejects.toThrow('Method Not Allowed');

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      });
    });

    it('should handle database errors gracefully', async () => {
      mockGetMethod.mockReturnValue('GET');
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database connection failed'));
      process.env.NODE_ENV = 'development'; // To check for 'details'

      const result = await userGetHandler(mockEvent as H3Event);

      expect(result).toEqual({
        success: false,
        strings: [],
        count: 0,
        error: 'ユーザーAPIでエラーが発生しました',
        details: 'Database connection failed', // Visible in development
      });
    });

    it('should hide error details in production', async () => {
        mockGetMethod.mockReturnValue('GET');
        mockPrisma.user.findMany.mockRejectedValue(new Error('Internal DB Error'));
        process.env.NODE_ENV = 'production';

        const result = await userGetHandler(mockEvent as H3Event);

        expect(result).toEqual({
            success: false,
            strings: [],
            count: 0,
            error: 'ユーザーAPIでエラーが発生しました',
            details: undefined, // Not visible in production
        });
         process.env.NODE_ENV = 'test'; // Reset back for other tests
    });
  });
});
