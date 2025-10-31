import type { Post, PostsResponse, CommentsResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export class PostsApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'PostsApiError';
  }
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new PostsApiError(
        response.status,
        `API error: ${response.status} - ${errorText}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PostsApiError) {
      throw error;
    }
    throw new Error(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export const postsApi = {
  /**
   * Fetch paginated list of posts
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10, max: 50)
   */
  async getPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    return fetchApi<PostsResponse>(`/posts?page=${page}&limit=${limit}`);
  },

  /**
   * Fetch a single post by ID
   * @param id - Post ID
   */
  async getPostById(id: number): Promise<Post> {
    return fetchApi<Post>(`/posts/${id}`);
  },

  /**
   * Fetch comments for a specific post
   * @param postId - Post ID
   * @param page - Page number (default: 1)
   * @param size - Items per page (default: 10)
   */
  async getCommentsByPostId(
    postId: number,
    page: number = 1,
    size: number = 10,
  ): Promise<CommentsResponse> {
    return fetchApi<CommentsResponse>(
      `/comments/${postId}?page=${page}&size=${size}`,
    );
  },
};
