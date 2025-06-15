export interface Post {
  id: number;
  content: string;
  userId: number | null;
  user: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

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
