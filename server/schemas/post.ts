import { z } from "zod";
import {
  createPostRequestSchema,
  updatePostRequestSchema,
  postParamsSchema,
  paginationQuerySchema,
  postResponseSchema,
  postsListResponseSchema,
  deletePostResponseSchema,
} from "../../types/schemas";

// 既存のスキーマをre-export（後方互換性のため）
export const createPostSchema = createPostRequestSchema;
export const updatePostSchema = updatePostRequestSchema;
export const getPostsQuerySchema = paginationQuerySchema;
export const postIdSchema = postParamsSchema;

// 新しいスキーマをre-export
export const postRequestSchema = createPostRequestSchema;
export const postUpdateSchema = updatePostRequestSchema;
export {
  postResponseSchema,
  postsListResponseSchema,
  deletePostResponseSchema,
};

// バリデーション関数
export const validateCreatePostRequest = (data: unknown) =>
  createPostRequestSchema.parse(data);
export const validateUpdatePostRequest = (data: unknown) =>
  updatePostRequestSchema.parse(data);
export const validatePostParams = (data: unknown) =>
  postParamsSchema.parse(data);
export const validatePostsQuery = (data: unknown) =>
  paginationQuerySchema.parse(data);

// 型のre-export（後方互換性のため）
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>;
export type PostIdParams = z.infer<typeof postIdSchema>;

// 新しい型のexport
export type CreatePostRequest = z.infer<typeof createPostRequestSchema>;
export type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>;
export type PostParams = z.infer<typeof postParamsSchema>;
export type PostsListResponse = z.infer<typeof postsListResponseSchema>;
export type DeletePostResponse = z.infer<typeof deletePostResponseSchema>;
