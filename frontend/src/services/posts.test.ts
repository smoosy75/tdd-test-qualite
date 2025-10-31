import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { postsApi, PostsApiError } from './posts';
import type { PostsResponse, Post, CommentsResponse } from '../types';

describe('postsApi', () => {
  beforeEach(() => {
    // Setup: Mock fetch before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Cleanup: Clear all mocks after each test
    vi.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should fetch posts with default pagination parameters', async () => {
      const mockResponse: PostsResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await postsApi.getPosts();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts?page=1&limit=10',
      );
    });

    it('should fetch posts with custom pagination parameters', async () => {
      const mockResponse: PostsResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 2,
          pageSize: 20,
          totalPages: 0,
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await postsApi.getPosts(2, 20);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts?page=2&limit=20',
      );
    });

    it('should return posts response with items and metadata', async () => {
      const mockResponse: PostsResponse = {
        items: [
          {
            id: 1,
            title: 'Test Post',
            content: 'Test content',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 5,
            author: {
              id: 'user1',
              name: 'John Doe',
              avatar: null,
            },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await postsApi.getPosts();

      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Test Post');
      expect(result.metadata.totalItems).toBe(1);
    });

    it('should throw PostsApiError when API returns error status', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      } as Response);

      await expect(postsApi.getPosts()).rejects.toThrow(PostsApiError);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      } as Response);

      await expect(postsApi.getPosts()).rejects.toThrow(
        'API error: 400 - Bad Request',
      );
    });

    it('should throw network error when fetch fails', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(
        new Error('Network failure'),
      );

      await expect(postsApi.getPosts()).rejects.toThrow(
        'Network error: Network failure',
      );
    });
  });

  describe('getPostById', () => {
    it('should fetch a single post by ID', async () => {
      const mockPost: Post = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 5,
        author: {
          id: 'user1',
          name: 'John Doe',
          avatar: null,
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      } as Response);

      await postsApi.getPostById(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts/1',
      );
    });

    it('should return post with all required fields', async () => {
      const mockPost: Post = {
        id: 42,
        title: 'Complete Post',
        content: 'Full content here',
        imageUrl: 'https://example.com/image.jpg',
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T16:30:00Z',
        commentCount: 10,
        author: {
          id: 'user2',
          name: 'Jane Smith',
          avatar: 'https://example.com/avatar.jpg',
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      } as Response);

      const result = await postsApi.getPostById(42);

      expect(result).toEqual(mockPost);
      expect(result.id).toBe(42);
      expect(result.title).toBe('Complete Post');
      expect(result.content).toBe('Full content here');
      expect(result.author.name).toBe('Jane Smith');
      expect(result.commentCount).toBe(10);
    });

    it('should throw PostsApiError when post is not found (404)', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Post not found',
      } as Response);

      await expect(postsApi.getPostById(999)).rejects.toThrow(PostsApiError);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Post not found',
      } as Response);

      await expect(postsApi.getPostById(999)).rejects.toThrow(
        'API error: 404 - Post not found',
      );
    });

    it('should throw PostsApiError when API returns server error (500)', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      await expect(postsApi.getPostById(1)).rejects.toThrow(PostsApiError);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      await expect(postsApi.getPostById(1)).rejects.toThrow(
        'API error: 500 - Internal Server Error',
      );
    });
  });

  describe('getCommentsByPostId', () => {
    it('should fetch comments with default pagination parameters', async () => {
      const mockResponse: CommentsResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await postsApi.getCommentsByPostId(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/comments/1?page=1&size=10',
      );
    });

    it('should fetch comments with custom pagination parameters', async () => {
      const mockResponse: CommentsResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 3,
          pageSize: 5,
          totalPages: 0,
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await postsApi.getCommentsByPostId(42, 3, 5);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/comments/42?page=3&size=5',
      );
    });

    it('should return comments response with items and metadata', async () => {
      const mockResponse: CommentsResponse = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'Great post!',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: {
              id: 'user1',
              name: 'John Doe',
              avatar: null,
            },
          },
          {
            id: 2,
            user_id: 'user2',
            content: 'Thanks for sharing',
            created_at: '2025-01-15T16:00:00Z',
            updated_at: '2025-01-15T16:00:00Z',
            author: {
              id: 'user2',
              name: 'Jane Smith',
              avatar: 'https://example.com/avatar.jpg',
            },
          },
        ],
        metadata: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await postsApi.getCommentsByPostId(1);

      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].content).toBe('Great post!');
      expect(result.items[1].author.name).toBe('Jane Smith');
      expect(result.metadata.totalItems).toBe(2);
    });

    it('should return empty array when post has no comments', async () => {
      const mockResponse: CommentsResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await postsApi.getCommentsByPostId(1);

      expect(result.items).toEqual([]);
      expect(result.items).toHaveLength(0);
      expect(result.metadata.totalItems).toBe(0);
    });

    it('should throw PostsApiError when API returns error status', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Post not found',
      } as Response);

      await expect(postsApi.getCommentsByPostId(999)).rejects.toThrow(
        PostsApiError,
      );

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Post not found',
      } as Response);

      await expect(postsApi.getCommentsByPostId(999)).rejects.toThrow(
        'API error: 404 - Post not found',
      );
    });
  });

  describe('PostsApiError', () => {
    it('should create error with status code and message', () => {
      const error = new PostsApiError(404, 'Not found');

      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
    });

    it('should have correct error name', () => {
      const error = new PostsApiError(500, 'Server error');

      expect(error.name).toBe('PostsApiError');
    });

    it('should be instanceof Error', () => {
      const error = new PostsApiError(400, 'Bad request');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PostsApiError);
    });
  });
});
