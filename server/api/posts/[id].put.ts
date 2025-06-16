import { prisma } from '~/server/database';
import { updatePostSchema, postIdSchema } from '~/server/schemas/post';
import { 
  createSuccessResponse, 
  handleApiError, 
  createValidationError, 
  createNotFoundError,
  createAuthorizationError 
} from '~/server/utils/errorHandler';
import { sanitizeForDatabase } from '~/server/utils/sanitize';
import { requireAuth } from '~/server/utils/auth';
import Logger from '~/server/utils/logger';
import { apiRateLimit } from '~/server/middleware/rateLimit';
import type { UpdatePostResponse } from '~/types/api';

export default defineEventHandler(async (event): Promise<UpdatePostResponse> => {
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

    // Require authentication for post updates
    const authUser = await requireAuth(event);

    const body = await readBody(event);
    
    const validation = updatePostSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError(
        'Invalid post data',
        validation.error.errors
      );
    }

    let { content } = validation.data;

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
      throw createAuthorizationError('You can only edit your own posts');
    }

    // Sanitize content if provided
    if (content) {
      content = sanitizeForDatabase(content);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(content && { content })
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    const response = {
      success: true,
      post: {
        ...updatedPost,
        createdAt: updatedPost.createdAt.toISOString(),
        updatedAt: updatedPost.updatedAt.toISOString(),
      }
    };

    const duration = Date.now() - startTime;
    Logger.logApiResponse(event, 200, duration, { 
      postId: id,
      userId: authUser.id 
    });
    Logger.info('Post updated successfully', { 
      postId: id,
      userId: authUser.id 
    });

    return response as UpdatePostResponse;

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