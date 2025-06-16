import { prisma } from '~/server/database';
import { loginSchema } from '~/server/schemas/user';
import { comparePassword, generateToken, getTokenExpiration } from '~/server/utils/auth';
import { 
  createSuccessResponse, 
  handleApiError, 
  createValidationError,
  createAuthenticationError 
} from '~/server/utils/errorHandler';
import Logger from '~/server/utils/logger';
import type { LoginResponse } from '~/types/auth';

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const startTime = Date.now();
  
  try {
    Logger.logApiRequest(event);

    const body = await readBody(event);
    
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError(
        'Invalid login data',
        validation.error.errors
      );
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createAuthenticationError('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw createAuthenticationError('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const response = createSuccessResponse({
      token,
      user: userResponse,
      expiresIn: getTokenExpiration(),
    });

    const duration = Date.now() - startTime;
    Logger.logApiResponse(event, 200, duration, { userId: user.id });
    Logger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email 
    });

    return response as LoginResponse;

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