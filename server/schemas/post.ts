import { z } from 'zod';

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(120, 'Content must be 120 characters or less')
    .trim(),
  userId: z.number().optional(),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(120, 'Content must be 120 characters or less')
    .trim()
    .optional(),
  userId: z.number().optional(),
});

export const getPostsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, 'Page must be a positive number'),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

export const postIdSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid post ID'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>;
export type PostIdParams = z.infer<typeof postIdSchema>;