import { prisma } from '~/server/database';
import { getPostsQuerySchema } from '~/server/schemas/post';
import { createSuccessResponse, handleApiError, createValidationError } from '~/server/utils/errorHandler';
import Logger from '~/server/utils/logger';
import { apiRateLimit } from '~/server/middleware/rateLimit';
import type { GetPostsResponse } from '~/types/api';

export default defineEventHandler(async (event): Promise<GetPostsResponse> => {
  const startTime = Date.now();
  
  try {
    Logger.logApiRequest(event);
    
    // Apply rate limiting
    await apiRateLimit(event);

    const query = getQuery(event);
    
    const validation = getPostsQuerySchema.safeParse(query);
    if (!validation.success) {
      throw createValidationError(
        'Invalid query parameters',
        validation.error.errors
      );
    }

    const { page, limit } = validation.data;
    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.post.count()
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    const response = {
      success: true,
      posts: posts.map(post => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasMore: page < totalPages
      }
    };

    const duration = Date.now() - startTime;
    Logger.logApiResponse(event, 200, duration, { 
      postsCount: posts.length,
      page,
      totalPosts 
    });

    return response as GetPostsResponse;

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