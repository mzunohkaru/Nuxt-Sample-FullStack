import { z } from 'zod'
import { errorResponseSchema, successResponseSchema } from './schemas'

// =============================================================================
// API レスポンス用ユーティリティ型
// =============================================================================

// 成功レスポンスのヘルパー型
export type SuccessApiResponse<T> = {
  success: true
  data: T
  timestamp: string
}

// エラーレスポンスのヘルパー型
export type ErrorApiResponse = z.infer<typeof errorResponseSchema>

// 統合APIレスポンス型
export type ApiResponse<T> = SuccessApiResponse<T> | ErrorApiResponse

// =============================================================================
// バリデーション用ユーティリティ関数
// =============================================================================

// 安全なパース関数（エラーの場合はundefinedを返す）
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | undefined {
  try {
    return schema.parse(data)
  } catch {
    return undefined
  }
}

// バリデーション結果型
export type ValidationResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: z.ZodError
}

// バリデーション関数（詳細なエラー情報を返す）
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}

// =============================================================================
// APIレスポンス作成ヘルパー関数
// =============================================================================

// 成功レスポンス作成
export function createSuccessResponse<T>(data: T, timestamp?: string): SuccessApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: timestamp || new Date().toISOString(),
  }
}

// エラーレスポンス作成
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  timestamp?: string
): ErrorApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: timestamp || new Date().toISOString(),
  }
}

// Zodエラーからエラーレスポンス作成
export function createValidationErrorResponse(
  error: z.ZodError,
  message: string = 'Validation failed',
  timestamp?: string
): ErrorApiResponse {
  return createErrorResponse(
    'VALIDATION_ERROR',
    message,
    error.errors,
    timestamp
  )
}

// =============================================================================
// 型ガード関数
// =============================================================================

// 成功レスポンスの型ガード
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessApiResponse<T> {
  return response.success === true
}

// エラーレスポンスの型ガード
export function isErrorResponse<T>(response: ApiResponse<T>): response is ErrorApiResponse {
  return response.success === false
}

// =============================================================================
// 共通バリデーション関数
// =============================================================================

// IDパラメータの検証
export function validateId(id: string | number): number {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id
  if (isNaN(numId) || numId <= 0) {
    throw new Error('Invalid ID format')
  }
  return numId
}

// ページネーション値の検証
export function validatePagination(page?: string, limit?: string) {
  const pageNum = page ? parseInt(page, 10) : 1
  const limitNum = limit ? parseInt(limit, 10) : 20

  if (isNaN(pageNum) || pageNum <= 0) {
    throw new Error('Invalid page number')
  }
  if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
    throw new Error('Invalid limit value')
  }

  return { page: pageNum, limit: limitNum }
}

// =============================================================================
// エラーハンドリング用ユーティリティ
// =============================================================================

// 共通エラーコード
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
}

// エラーメッセージマップ
export const ERROR_MESSAGES = {
  [ApiErrorCode.VALIDATION_ERROR]: 'The provided data is invalid',
  [ApiErrorCode.NOT_FOUND]: 'The requested resource was not found',
  [ApiErrorCode.UNAUTHORIZED]: 'Authentication is required',
  [ApiErrorCode.FORBIDDEN]: 'You do not have permission to access this resource',
  [ApiErrorCode.CONFLICT]: 'The request conflicts with the current state',
  [ApiErrorCode.INTERNAL_ERROR]: 'An internal server error occurred',
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded. Please try again later',
  [ApiErrorCode.INVALID_TOKEN]: 'The provided token is invalid',
  [ApiErrorCode.EXPIRED_TOKEN]: 'The provided token has expired',
} as const

// エラーレスポンス作成（定義済みエラーコード用）
export function createApiError(
  code: ApiErrorCode,
  customMessage?: string,
  details?: any,
  timestamp?: string
): ErrorApiResponse {
  return createErrorResponse(
    code,
    customMessage || ERROR_MESSAGES[code],
    details,
    timestamp
  )
}

// =============================================================================
// 型変換ユーティリティ
// =============================================================================

// Prismaの日付型をISO文字列に変換
export function formatDateForApi(date: Date): string {
  return date.toISOString()
}

// Prismaエンティティの日付フィールドを文字列に変換
export function formatEntityDates<T extends Record<string, any>>(
  entity: T,
  dateFields: (keyof T)[] = ['createdAt', 'updatedAt']
): T {
  const formatted = { ...entity }
  
  for (const field of dateFields) {
    if (formatted[field] instanceof Date) {
      formatted[field] = formatDateForApi(formatted[field] as Date) as T[keyof T]
    }
  }
  
  return formatted
}