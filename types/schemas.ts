import { z } from 'zod'

// =============================================================================
// 基本エンティティスキーマ
// =============================================================================

export const userEntitySchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const postEntitySchema = z.object({
  id: z.number().int().positive(),
  content: z.string().min(1).max(120),
  userId: z.number().int().positive().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const postWithUserSchema = postEntitySchema.extend({
  user: userEntitySchema.pick({ id: true, name: true }).nullable(),
})

// =============================================================================
// 認証関連スキーマ
// =============================================================================

// リクエストスキーマ
export const registerRequestSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  name: z.string().min(1, 'Name is required').max(100).trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// レスポンススキーマ
export const authSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    user: userEntitySchema,
    expiresIn: z.number().int().positive(),
  }),
  timestamp: z.string().datetime(),
})

export const logoutResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string(),
  }),
  timestamp: z.string().datetime(),
})

export const jwtPayloadSchema = z.object({
  userId: z.number().int().positive(),
  email: z.string().email(),
  iat: z.number().int().optional(),
  exp: z.number().int().optional(),
})

// =============================================================================
// 投稿関連スキーマ
// =============================================================================

// リクエストスキーマ
export const createPostRequestSchema = z.object({
  content: z.string().min(1, 'Content is required').max(120, 'Content must be 120 characters or less').trim(),
})

export const updatePostRequestSchema = z.object({
  content: z.string().min(1, 'Content is required').max(120, 'Content must be 120 characters or less').trim(),
})

export const postParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0, 'Invalid post ID'),
})

// レスポンススキーマ  
export const postResponseSchema = z.object({
  success: z.literal(true),
  data: postWithUserSchema,
  timestamp: z.string().datetime(),
})

export const postsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    posts: z.array(postWithUserSchema),
    pagination: z.object({
      currentPage: z.number().int().positive(),
      totalPages: z.number().int().min(0),
      totalPosts: z.number().int().min(0),
      hasMore: z.boolean(),
    }),
  }),
  timestamp: z.string().datetime(),
})

export const deletePostResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string(),
    deletedId: z.number().int().positive(),
  }),
  timestamp: z.string().datetime(),
})

// =============================================================================
// ユーザー関連スキーマ
// =============================================================================

// リクエストスキーマ
export const userParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0, 'Invalid user ID'),
})

export const updateUserRequestSchema = z.object({
  email: z.string().email('Invalid email format').max(255).optional(),
  name: z.string().min(1, 'Name is required').max(100).trim().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128).optional(),
})

// レスポンススキーマ
export const userResponseSchema = z.object({
  success: z.literal(true),
  data: userEntitySchema,
  timestamp: z.string().datetime(),
})

export const usersListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    users: z.array(userEntitySchema),
    pagination: z.object({
      currentPage: z.number().int().positive(),
      totalPages: z.number().int().min(0),
      totalUsers: z.number().int().min(0),
      hasMore: z.boolean(),
    }),
  }),
  timestamp: z.string().datetime(),
})

// =============================================================================
// 共通スキーマ
// =============================================================================

// ページネーションクエリ
export const paginationQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => parseInt(val)).refine((val) => val > 0, 'Page must be a positive number'),
  limit: z.string().optional().default('20').transform((val) => parseInt(val)).refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
})

// エラーレスポンス
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
  timestamp: z.string().datetime(),
})

// 汎用成功レスポンス
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
  timestamp: z.string().datetime(),
})

// =============================================================================
// 型エクスポート（TypeScriptの型推論を利用）
// =============================================================================

// エンティティ型
export type User = z.infer<typeof userEntitySchema>
export type Post = z.infer<typeof postEntitySchema>
export type PostWithUser = z.infer<typeof postWithUserSchema>

// 認証関連型
export type RegisterRequest = z.infer<typeof registerRequestSchema>
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type AuthSuccessResponse = z.infer<typeof authSuccessResponseSchema>
export type LogoutResponse = z.infer<typeof logoutResponseSchema>
export type JwtPayload = z.infer<typeof jwtPayloadSchema>

// 投稿関連型
export type CreatePostRequest = z.infer<typeof createPostRequestSchema>
export type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>
export type PostParams = z.infer<typeof postParamsSchema>
export type PostResponse = z.infer<typeof postResponseSchema>
export type PostsListResponse = z.infer<typeof postsListResponseSchema>
export type DeletePostResponse = z.infer<typeof deletePostResponseSchema>

// ユーザー関連型
export type UserParams = z.infer<typeof userParamsSchema>
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
export type UsersListResponse = z.infer<typeof usersListResponseSchema>

// 共通型
export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type SuccessResponse = z.infer<typeof successResponseSchema>

// APIレスポンス統合型
export type ApiResponse<T = any> = 
  | (Omit<SuccessResponse, 'data'> & { data: T })
  | ErrorResponse