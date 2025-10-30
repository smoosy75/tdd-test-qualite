// Author information
export interface Author {
  id: string;
  name: string;
  avatar: string | null;
}

// Post type
export interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  isPublished: boolean;
  created_at: string;
  updatedAt: string;
  commentCount: number;
  author: Author;
}

// Comment type
export interface Comment {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: Author;
}

// Pagination metadata
export interface PaginationMetadata {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  items: T[];
  metadata: PaginationMetadata;
}

// API response types
export type PostsResponse = PaginatedResponse<Post>;
export type CommentsResponse = PaginatedResponse<Comment>;
