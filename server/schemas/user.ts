import { z } from "zod";
import {
  registerRequestSchema,
  loginRequestSchema,
  updateUserRequestSchema,
  userParamsSchema,
  paginationQuerySchema,
  authSuccessResponseSchema,
  logoutResponseSchema,
  userResponseSchema,
  usersListResponseSchema,
  jwtPayloadSchema,
} from "../../types/schemas";

// 既存のスキーマをre-export（後方互換性のため）
export const createUserSchema = registerRequestSchema;
export const updateUserSchema = updateUserRequestSchema;
export const loginSchema = loginRequestSchema;
export const getUsersQuerySchema = paginationQuerySchema;
export const userIdSchema = userParamsSchema;

// 新しいスキーマをre-export
export const registerSchema = registerRequestSchema;
export const authResponseSchema = authSuccessResponseSchema;
export {
  logoutResponseSchema,
  userResponseSchema,
  usersListResponseSchema,
  jwtPayloadSchema,
};

// バリデーション関数
export const validateRegisterRequest = (data: unknown) =>
  registerRequestSchema.parse(data);
export const validateLoginRequest = (data: unknown) =>
  loginRequestSchema.parse(data);
export const validateUpdateUserRequest = (data: unknown) =>
  updateUserRequestSchema.parse(data);
export const validateUserParams = (data: unknown) =>
  userParamsSchema.parse(data);
export const validatePaginationQuery = (data: unknown) =>
  paginationQuerySchema.parse(data);
export const validateJwtPayload = (data: unknown) =>
  jwtPayloadSchema.parse(data);

// 型のre-export（後方互換性のため）
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type UserIdParams = z.infer<typeof userIdSchema>;

// 新しい型のexport
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type AuthSuccessResponse = z.infer<typeof authSuccessResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersListResponse = z.infer<typeof usersListResponseSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
