import { prisma } from '~/server/database';
import { postIdSchema } from '~/server/schemas/post';
import { 
  createSuccessResponse, 
  handleApiError, 
  createValidationError, 
  createNotFoundError,
  createAuthorizationError 
} from '~/server/utils/errorHandler';
import { requireAuth } from '~/server/utils/auth';
import Logger from '~/server/utils/logger';
import { apiRateLimit } from '~/server/middleware/rateLimit';
import type { DeletePostResponse } from '~/types/api';

export default defineEventHandler(async (event): Promise<DeletePostResponse> => {
  const startTime = Date.now();
  
  try {
    Logger.logApiRequest(event);
    
    // Apply rate limiting
    await apiRateLimit(event);

    // Validate route parameter
    const params = { id: getRouterParam(event, 'id') };
    const paramValidation = postIdSchema.safeParse(params);
    if (!paramValidation.success) {
      throw createValidationError(
        'Invalid post ID',
        paramValidation.error.errors
      );
    }

    const { id } = paramValidation.data;

    // Require authentication for post deletion
    const authUser = await requireAuth(event);

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!existingPost) {
      throw createNotFoundError('Post not found');
    }

    // Check if user owns the post
    if (existingPost.userId !== authUser.id) {
      throw createAuthorizationError('You can only delete your own posts');
    }

    await prisma.post.delete({
      where: { id }
    });

    const response = {
      success: true,
      message: 'Post deleted successfully'
    };

    const duration = Date.now() - startTime;
    Logger.logApiResponse(event, 200, duration, { 
      postId: id,
      userId: authUser.id 
    });
    Logger.info('Post deleted successfully', { 
      postId: id,
      userId: authUser.id 
    });

    return response as DeletePostResponse;

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