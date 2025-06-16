export interface Post {
  id: number;
  content: string;
  userId: number | null;
  user: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export interface CreatePostResponse {
  success: boolean;
  post: Post;
}

export interface UpdatePostResponse {
  success: boolean;
  post: Post;
}

export interface DeletePostResponse {
  success: boolean;
  message: string;
}

export interface GetPostsResponse {
  success: boolean;
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
  };
}

export interface GetUsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasMore: boolean;
  };
  timestamp: string;
}

export interface GetUserResponse {
  success: boolean;
  user: User;
  timestamp: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}
