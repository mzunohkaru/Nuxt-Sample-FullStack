import { prisma } from "../../database";
import { getUsersQuerySchema } from '~/server/schemas/user';
import { createSuccessResponse, handleApiError, createValidationError, createMethodNotAllowedError } from '~/server/utils/errorHandler';
import Logger from '~/server/utils/logger';
import { apiRateLimit } from '~/server/middleware/rateLimit';

export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  
  try {
    Logger.logApiRequest(event);

    if (getMethod(event) !== "GET") {
      throw createMethodNotAllowedError("Only GET method is allowed");
    }

    // Apply rate limiting
    await apiRateLimit(event);

    const query = getQuery(event);
    
    const validation = getUsersQuerySchema.safeParse(query);
    if (!validation.success) {
      throw createValidationError(
        'Invalid query parameters',
        validation.error.errors
      );
    }

    const { page, limit } = validation.data;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit
      }),
      prisma.user.count()
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    const response = {
      success: true,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasMore: page < totalPages
      },
      timestamp: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    Logger.logApiResponse(event, 200, duration, { 
      usersCount: users.length,
      page,
      totalUsers 
    });

    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    Logger.logError(event, error);
    Logger.logApiResponse(event, error instanceof Error ? 400 : 500, duration);
    
    const errorResponse = handleApiError(error);
    
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error 
        ? (error as any).statusCode 
        : 500,
      statusMessage: errorResponse.error.message,
      data: errorResponse,
    });
  }
});
