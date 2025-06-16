import { requireAuth } from '~/server/utils/auth';
import { createSuccessResponse, handleApiError } from '~/server/utils/errorHandler';
import Logger from '~/server/utils/logger';
import type { LogoutResponse } from '~/types/auth';

export default defineEventHandler(async (event): Promise<LogoutResponse> => {
  const startTime = Date.now();
  
  try {
    Logger.logApiRequest(event);

    const user = await requireAuth(event);

    const response = createSuccessResponse({
      message: 'Logged out successfully',
    });

    const duration = Date.now() - startTime;
    Logger.logApiResponse(event, 200, duration, { userId: user.id });
    Logger.info('User logged out successfully', { 
      userId: user.id, 
      email: user.email 
    });

    return response as LogoutResponse;

  } catch (error) {
    const duration = Date.now() - startTime;
    Logger.logError(event, error);
    Logger.logApiResponse(event, error instanceof Error ? 401 : 500, duration);
    
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