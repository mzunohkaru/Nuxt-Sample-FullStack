import { prisma } from '~/server/database';
import { createUserSchema } from '~/server/schemas/user';
import { hashPassword, generateToken, getTokenExpiration } from '~/server/utils/auth';
import { 
  createSuccessResponse,
  handleApiError, 
  createValidationError,
  createConflictError 
} from '~/server/utils/errorHandler';
import Logger from '~/server/utils/logger';
import type { RegisterResponse } from '~/types/auth';

export default defineEventHandler(async (event): Promise<RegisterResponse> => {
  const startTime = Date.now();
  
  try {
    Logger.logApiRequest(event);

    const body = await readBody(event);
    
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError(
        'Invalid registration data',
        validation.error.errors
      );
    }

    const { email, name, password } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createConflictError('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

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
    Logger.logApiResponse(event, 201, duration, { userId: user.id });
    Logger.info('User registered successfully', { 
      userId: user.id, 
      email: user.email 
    });

    return response as RegisterResponse;

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