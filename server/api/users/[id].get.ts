import { prisma } from "../../database";
import { userIdSchema } from '~/server/schemas/user';
import { 
  createSuccessResponse, 
  handleApiError, 
  createValidationError, 
  createNotFoundError, 
  createMethodNotAllowedError 
} from '~/server/utils/errorHandler';
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

    // Validate route parameter
    const params = { id: getRouterParam(event, 'id') };
    const paramValidation = userIdSchema.safeParse(params);
    if (!paramValidation.success) {
      throw createValidationError(
        'Invalid user ID',
        paramValidation.error.errors
      );
    }

    const { id } = paramValidation.data;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createNotFoundError("User not found");
    }

    const response = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    Logger.logApiResponse(event, 200, duration, { userId: id });

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
