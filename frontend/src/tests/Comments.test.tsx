import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comments from '../components/Comments';
import { postsApi } from '../services/posts';

// Mock the postsApi service
vi.mock('../services/posts', () => ({
  postsApi: {
    getCommentsByPostId: vi.fn(),
  },
}));

  describe('Comments Component', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

  describe('Loading State', () => {
    it('should display loading spinner while fetching comments', () => {
      vi.mocked(postsApi.getCommentsByPostId).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      render(<Comments postId={1} />);

      expect(screen.getByRole('alert', { busy: true }) || screen.getByText('Loading comments...')).toBeInTheDocument();
      expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    it('should display "Loading comments..." text', () => {
      vi.mocked(postsApi.getCommentsByPostId).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      render(<Comments postId={1} />);

      expect(screen.getByText('Loading comments...')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render comments list when data is successfully fetched', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'Test comment',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          }
        ],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });
    });

    it('should display comment author name', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'Test comment',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          }
        ],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should display comment content', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'This is my test comment content',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          }
        ],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('This is my test comment content')).toBeInTheDocument();
      });
    });

    it('should display comment creation date formatted correctly', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'Test comment',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          }
        ],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
      });
    });

    it('should display author avatar image when available', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'Test comment',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: 'https://example.com/avatar.jpg' }
          }
        ],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      });
    });

    it('should display avatar placeholder with first letter when no avatar', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'Test comment',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          }
        ],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        const placeholder = document.querySelector('.comment-avatar-placeholder');
        expect(placeholder).toBeInTheDocument();
        expect(placeholder).toHaveTextContent('J');
      });
    });

    it('should display "Edited" label when comment was modified', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'Test comment',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T16:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          }
        ],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/Edited:/)).toBeInTheDocument();
      });
    });

    it('should not display "Edited" label when comment was not modified', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'Test comment',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          }
        ],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.queryByText(/Edited:/)).not.toBeInTheDocument();
      });
    });

    it('should display comment count in title', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'Test comment 1',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          },
          {
            id: 2,
            user_id: 'user2',
            content: 'Test comment 2',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user2', name: 'Jane Smith', avatar: null }
          }
        ],
        metadata: { totalItems: 2, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Comments (2)')).toBeInTheDocument();
      });
    });

    it('should render multiple comments', async () => {
      const mockComments = {
        items: [
          {
            id: 1,
            user_id: 'user1',
            content: 'First comment',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          },
          {
            id: 2,
            user_id: 'user2',
            content: 'Second comment',
            created_at: '2025-01-15T16:30:00Z',
            updated_at: '2025-01-15T16:30:00Z',
            author: { id: 'user2', name: 'Jane Smith', avatar: null }
          },
          {
            id: 3,
            user_id: 'user3',
            content: 'Third comment',
            created_at: '2025-01-15T17:30:00Z',
            updated_at: '2025-01-15T17:30:00Z',
            author: { id: 'user3', name: 'Bob Johnson', avatar: null }
          }
        ],
        metadata: { totalItems: 3, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('First comment')).toBeInTheDocument();
        expect(screen.getByText('Second comment')).toBeInTheDocument();
        expect(screen.getByText('Third comment')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no comments exist', async () => {
      const mockComments = {
        items: [],
        metadata: { totalItems: 0, currentPage: 1, pageSize: 10, totalPages: 0 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
      });
    });

    it('should display "Be the first to comment!" message', async () => {
      const mockComments = {
        items: [],
        metadata: { totalItems: 0, currentPage: 1, pageSize: 10, totalPages: 0 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/Be the first to comment!/)).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('should display error message when API call fails', async () => {
      vi.mocked(postsApi.getCommentsByPostId).mockRejectedValue(
        new Error('Failed to fetch comments')
      );

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/Error: Failed to fetch comments/)).toBeInTheDocument();
      });
    });

    it('should display "Try Again" button on error', async () => {
      vi.mocked(postsApi.getCommentsByPostId).mockRejectedValue(
        new Error('Failed to fetch comments')
      );

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    it('should retry fetching comments when "Try Again" button is clicked', async () => {
      vi.mocked(postsApi.getCommentsByPostId)
        .mockRejectedValueOnce(new Error('Failed to fetch comments'))
        .mockResolvedValueOnce({
          items: [{
            id: 1,
            user_id: 'user1',
            content: 'Test comment',
            created_at: '2025-01-15T15:30:00Z',
            updated_at: '2025-01-15T15:30:00Z',
            author: { id: 'user1', name: 'John Doe', avatar: null }
          }],
          metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
        });

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });
    });

    it('should reset to page 1 when retry button is clicked', async () => {
      const mockSuccess = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId)
        .mockResolvedValueOnce(mockSuccess)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(mockSuccess);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(postsApi.getCommentsByPostId).toHaveBeenLastCalledWith(1, 1, 10);
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when there are multiple pages', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      });
    });

    it('should not display pagination when there is only one page', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });

    it('should disable "Previous" button on first page', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton).toBeDisabled();
      });
    });

    it('should disable "Next" button on last page', async () => {
      const mockPage1 = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      const mockPage2 = {
        items: [{
          id: 2,
          user_id: 'user2',
          content: 'Test comment 2',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user2', name: 'Jane Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 2, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      });
    });

    it('should display current page and total pages', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 50, currentPage: 1, pageSize: 10, totalPages: 5 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });
    });

    it('should fetch next page when "Next" button is clicked', async () => {
      const mockPage1 = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Page 1 comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      const mockPage2 = {
        items: [{
          id: 2,
          user_id: 'user2',
          content: 'Page 2 comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user2', name: 'Jane Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 2, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 comment')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(postsApi.getCommentsByPostId).toHaveBeenCalledWith(1, 2, 10);
        expect(screen.getByText('Page 2 comment')).toBeInTheDocument();
      });
    });

    it('should fetch previous page when "Previous" button is clicked', async () => {
      const mockPage1 = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Page 1 comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      const mockPage2 = {
        items: [{
          id: 2,
          user_id: 'user2',
          content: 'Page 2 comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user2', name: 'Jane Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 2, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2)
        .mockResolvedValueOnce(mockPage1);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 comment')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Page 2 comment')).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await userEvent.click(prevButton);

      await waitFor(() => {
        expect(postsApi.getCommentsByPostId).toHaveBeenLastCalledWith(1, 1, 10);
        expect(screen.getByText('Page 1 comment')).toBeInTheDocument();
      });
    });

    it('should not go below page 1 when clicking Previous', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should not exceed total pages when clicking Next', async () => {
      const mockPage1 = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      const mockPage2 = {
        items: [{
          id: 2,
          user_id: 'user2',
          content: 'Test comment 2',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user2', name: 'Jane Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 2, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
        expect(nextButton).toBeDisabled();
      });
    });
  });

  describe('API Integration', () => {
    it('should call postsApi.getCommentsByPostId with correct postId', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={42} />);

      await waitFor(() => {
        expect(postsApi.getCommentsByPostId).toHaveBeenCalledWith(42, 1, 10);
      });
    });

    it('should call API with default pagination (page=1, size=10)', async () => {
      const mockComments = {
        items: [],
        metadata: { totalItems: 0, currentPage: 1, pageSize: 10, totalPages: 0 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(postsApi.getCommentsByPostId).toHaveBeenCalledWith(1, 1, 10);
      });
    });

    it('should refetch comments when postId prop changes', async () => {
      const mockComments1 = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Comment for post 1',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      const mockComments2 = {
        items: [{
          id: 2,
          user_id: 'user2',
          content: 'Comment for post 2',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user2', name: 'Jane Doe', avatar: null }
        }],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId)
        .mockResolvedValueOnce(mockComments1)
        .mockResolvedValueOnce(mockComments2);

      const { rerender } = render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Comment for post 1')).toBeInTheDocument();
      });

      rerender(<Comments postId={2} />);

      await waitFor(() => {
        expect(postsApi.getCommentsByPostId).toHaveBeenCalledWith(2, 1, 10);
        expect(screen.getByText('Comment for post 2')).toBeInTheDocument();
      });
    });

    it('should refetch comments when page changes', async () => {
      const mockPage1 = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Page 1 comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      const mockPage2 = {
        items: [{
          id: 2,
          user_id: 'user2',
          content: 'Page 2 comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user2', name: 'Jane Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 2, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(postsApi.getCommentsByPostId).toHaveBeenCalledWith(1, 1, 10);
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(postsApi.getCommentsByPostId).toHaveBeenCalledWith(1, 2, 10);
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in US locale with month, day, year, and time', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        const dateElement = screen.getByText(/Jan 15, 2025/);
        expect(dateElement).toBeInTheDocument();
        expect(dateElement.textContent).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
      });
    });

    it('should handle ISO date strings', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-12-25T10:45:30Z',
          updated_at: '2025-12-25T10:45:30Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/Dec 25, 2025/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible comment structure', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });

      const commentCard = document.querySelector('.comment-card');
      expect(commentCard).toBeInTheDocument();
      expect(commentCard?.querySelector('.comment-author')).toBeInTheDocument();
      expect(commentCard?.querySelector('.comment-content')).toBeInTheDocument();
    });

    it('should have alt text for avatar images', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: 'https://example.com/avatar.jpg' }
        }],
        metadata: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('alt', 'John Doe');
      });
    });

    it('should have disabled state properly indicated on buttons', async () => {
      const mockComments = {
        items: [{
          id: 1,
          user_id: 'user1',
          content: 'Test comment',
          created_at: '2025-01-15T15:30:00Z',
          updated_at: '2025-01-15T15:30:00Z',
          author: { id: 'user1', name: 'John Doe', avatar: null }
        }],
        metadata: { totalItems: 20, currentPage: 1, pageSize: 10, totalPages: 2 }
      };

      vi.mocked(postsApi.getCommentsByPostId).mockResolvedValue(mockComments);

      render(<Comments postId={1} />);

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton).toBeDisabled();
        expect(prevButton).toHaveAttribute('disabled');
      });
    });
  });
});

