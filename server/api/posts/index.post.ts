import { prisma } from "~/server/database";
import { createPostSchema } from "~/server/schemas/post";
import {
  createSuccessResponse,
  handleApiError,
  createValidationError,
} from "~/server/utils/errorHandler";
import { sanitizeForDatabase } from "~/server/utils/sanitize";
import { optionalAuth } from "~/server/utils/auth";
import Logger from "~/server/utils/logger";
import { apiRateLimit } from "~/server/middleware/rateLimit";
import type { CreatePostResponse } from "~/types/api";

export default defineEventHandler(
  async (event): Promise<CreatePostResponse> => {
    const startTime = Date.now();

    try {
      Logger.logApiRequest(event);

      // Apply rate limiting
      await apiRateLimit(event);

      const body = await readBody(event);

      const validation = createPostSchema.safeParse(body);
      if (!validation.success) {
        throw createValidationError(
          "Invalid post data",
          validation.error.errors
        );
      }

      let { content, userId } = validation.data;

      // Get authenticated user if available
      const authUser = await optionalAuth(event);
      if (authUser) {
        userId = authUser.id;
      }

      // Sanitize content for database storage
      content = sanitizeForDatabase(content);

      const post = await prisma.post.create({
        data: {
          content,
          userId: userId || null,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      const response = {
        success: true,
        post: {
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        },
      };

      const duration = Date.now() - startTime;
      Logger.logApiResponse(event, 201, duration, {
        postId: post.id,
        id: userId || "anonymous",
      });
      Logger.info("Post created successfully", {
        postId: post.id,
        id: userId || "anonymous",
        contentLength: content.length,
      });

      setResponseStatus(event, 201);
      return response as CreatePostResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.logError(event, error);
      Logger.logApiResponse(
        event,
        error instanceof Error ? 400 : 500,
        duration
      );

      const errorResponse = handleApiError(error);

      throw createError({
        statusCode:
          error instanceof Error && "statusCode" in error
            ? (error as any).statusCode
            : 500,
        statusMessage: errorResponse.error.message,
        data: errorResponse,
      });
    }
  }
);
