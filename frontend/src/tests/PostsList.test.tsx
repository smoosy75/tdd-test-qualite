import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import PostsList from '../components/PostsList';
import { postsApi } from '../services/posts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the postsApi service
vi.mock('../services/posts', () => ({
  postsApi: {
    getPosts: vi.fn(),
  },
}));

describe('PostsList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPostsList = () => {
    return render(
      <MemoryRouter>
        <PostsList />
      </MemoryRouter>,
    );
  };

  describe('Loading State', () => {
    it('should display loading spinner while fetching posts', () => {
      vi.mocked(postsApi.getPosts).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      renderPostsList();

      expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    it('should display "Loading posts..." text', () => {
      vi.mocked(postsApi.getPosts).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      renderPostsList();

      expect(screen.getByText('Loading posts...')).toBeInTheDocument();
    });
  });

  describe('Success State - Header', () => {
    it('should render page title "All Posts"', async () => {
      const mockResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: 'All Posts' }),
        ).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      const mockResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByText(/Discover and read the latest posts/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Success State - Posts Grid', () => {
    it('should render all posts from API response', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post 1',
            content: '<p>Content 1</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
          {
            id: 2,
            title: 'Post 2',
            content: '<p>Content 2</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user2', name: 'Jane Smith', avatar: null },
          },
        ],
        metadata: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
        expect(screen.getByText('Post 2')).toBeInTheDocument();
      });
    });

    it('should render posts in a grid layout', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post 1',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(document.querySelector('.posts-grid')).toBeInTheDocument();
      });
    });

    it('should display post title for each post', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'My Amazing Post Title',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('My Amazing Post Title')).toBeInTheDocument();
      });
    });

    it('should display truncated post excerpt', async () => {
      const longContent = '<p>' + 'A'.repeat(250) + '</p>';
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: longContent,
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const excerpt = screen.getByText(/A{100,200}\.\.\./);
        expect(excerpt).toBeInTheDocument();
      });
    });

    it('should not truncate short post content', async () => {
      const shortContent = '<p>Short content here</p>';
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: shortContent,
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const excerpt = screen.getByText('Short content here');
        expect(excerpt.textContent).not.toContain('...');
      });
    });

    it('should strip HTML tags from excerpt', async () => {
      const htmlContent =
        '<p>This is <strong>bold</strong> and <em>italic</em> text</p>';
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: htmlContent,
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const excerpt = screen.getByText(/This is bold and italic text/);
        expect(excerpt.innerHTML).not.toContain('<strong>');
        expect(excerpt.innerHTML).not.toContain('<em>');
      });
    });

    it('should display post image when available', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post with Image',
            content: '<p>Content</p>',
            imageUrl: 'https://example.com/image.jpg',
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const image = screen.getByAltText('Post with Image');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      });
    });

    it('should not display image section when imageUrl is null', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post without Image',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post without Image')).toBeInTheDocument();
      });

      expect(
        document.querySelector('.post-card-image'),
      ).not.toBeInTheDocument();
    });

    it('should display author name for each post', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should display author avatar when available', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: {
              id: 'user1',
              name: 'John Doe',
              avatar: 'https://example.com/avatar.jpg',
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

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      });
    });

    it('should display avatar placeholder when no avatar', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const placeholder = document.querySelector(
          '.post-card-avatar-placeholder',
        );
        expect(placeholder).toBeInTheDocument();
        expect(placeholder).toHaveTextContent('J');
      });
    });

    it('should display formatted creation date', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
      });
    });

    it('should display comment count', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 5,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('5 comments')).toBeInTheDocument();
      });
    });

    it('should use singular "comment" when count is 1', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 1,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('1 comment')).toBeInTheDocument();
      });
    });

    it('should use plural "comments" when count is not 1', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post 1',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
          {
            id: 2,
            title: 'Post 2',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 2,
            author: { id: 'user2', name: 'Jane Smith', avatar: null },
          },
        ],
        metadata: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('0 comments')).toBeInTheDocument();
        expect(screen.getByText('2 comments')).toBeInTheDocument();
      });
    });

    it('should display "Read more" link for each post', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText(/Read more/)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    it('should link post title to detail page', async () => {
      const mockResponse = {
        items: [
          {
            id: 42,
            title: 'Test Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const titleLink = screen.getByText('Test Post').closest('a');
        expect(titleLink).toHaveAttribute('href', '/posts/42');
      });
    });

    it('should link post image to detail page', async () => {
      const mockResponse = {
        items: [
          {
            id: 42,
            title: 'Post with Image',
            content: '<p>Content</p>',
            imageUrl: 'https://example.com/image.jpg',
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const imageLink = screen.getByAltText('Post with Image').closest('a');
        expect(imageLink).toHaveAttribute('href', '/posts/42');
      });
    });

    it('should link "Read more" to detail page', async () => {
      const mockResponse = {
        items: [
          {
            id: 99,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const readMoreLink = screen.getByText(/Read more/).closest('a');
        expect(readMoreLink).toHaveAttribute('href', '/posts/99');
      });
    });

    it('should generate correct URLs for different post IDs', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post 1',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
          {
            id: 2,
            title: 'Post 2',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user2', name: 'Jane Smith', avatar: null },
          },
        ],
        metadata: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const link1 = screen.getByText('Post 1').closest('a');
        const link2 = screen.getByText('Post 2').closest('a');
        expect(link1).toHaveAttribute('href', '/posts/1');
        expect(link2).toHaveAttribute('href', '/posts/2');
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no posts exist', async () => {
      const mockResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 2, name: /No Posts Found/i }),
        ).toBeInTheDocument();
      });
    });

    it('should display descriptive empty message', async () => {
      const mockResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByText(/There are no posts to display yet/i),
        ).toBeInTheDocument();
      });
    });

    it('should not display grid when no posts', async () => {
      const mockResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText(/No Posts Found/i)).toBeInTheDocument();
      });

      expect(document.querySelector('.posts-grid')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error heading when API call fails', async () => {
      vi.mocked(postsApi.getPosts).mockRejectedValue(
        new Error('Failed to fetch posts'),
      );

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 2, name: /Error/i }),
        ).toBeInTheDocument();
      });
    });

    it('should display error message', async () => {
      vi.mocked(postsApi.getPosts).mockRejectedValue(
        new Error('Failed to fetch posts'),
      );

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch posts/)).toBeInTheDocument();
      });
    });

    it('should display "Try Again" button on error', async () => {
      vi.mocked(postsApi.getPosts).mockRejectedValue(
        new Error('Failed to fetch posts'),
      );

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Try Again/i }),
        ).toBeInTheDocument();
      });
    });

    it('should retry fetching posts when "Try Again" is clicked', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Try Again/i }),
        ).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Post')).toBeInTheDocument();
      });
    });

    it('should reset to page 1 when retry button is clicked', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Try Again/i }),
        ).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(postsApi.getPosts).toHaveBeenLastCalledWith(1, 10);
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when there are multiple pages', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Previous/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Next/i }),
        ).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      });
    });

    it('should not display pagination when there is only one page', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /Previous/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Next/i }),
      ).not.toBeInTheDocument();
    });

    it('should display current page and total pages', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 50,
          currentPage: 1,
          pageSize: 10,
          totalPages: 5,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });
    });

    it('should disable "Previous" button on first page', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Previous/i });
        expect(prevButton).toBeDisabled();
      });
    });

    it('should enable "Previous" button on pages after first', async () => {
      const mockPage1 = {
        items: [
          {
            id: 1,
            title: 'Post 1',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      const mockPage2 = {
        items: [
          {
            id: 2,
            title: 'Post 2',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user2', name: 'Jane Smith', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 2,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Previous/i });
        expect(prevButton).not.toBeDisabled();
      });
    });

    it('should disable "Next" button on last page', async () => {
      const mockPage1 = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      const mockPage2 = {
        items: [
          {
            id: 2,
            title: 'Post 2',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user2', name: 'Jane Smith', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 2,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
      });
    });

    it('should enable "Next" button on pages before last', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 30,
          currentPage: 1,
          pageSize: 10,
          totalPages: 3,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/i });
        expect(nextButton).not.toBeDisabled();
      });
    });

    it('should fetch next page when "Next" button is clicked', async () => {
      const mockPage1 = {
        items: [
          {
            id: 1,
            title: 'Page 1 Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      const mockPage2 = {
        items: [
          {
            id: 2,
            title: 'Page 2 Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user2', name: 'Jane Smith', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 2,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Page 1 Post')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(postsApi.getPosts).toHaveBeenCalledWith(2, 10);
        expect(screen.getByText('Page 2 Post')).toBeInTheDocument();
      });
    });

    it('should fetch previous page when "Previous" button is clicked', async () => {
      const mockPage1 = {
        items: [
          {
            id: 1,
            title: 'Page 1 Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      const mockPage2 = {
        items: [
          {
            id: 2,
            title: 'Page 2 Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user2', name: 'Jane Smith', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 2,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2)
        .mockResolvedValueOnce(mockPage1);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Page 1 Post')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Page 2 Post')).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /Previous/i });
      await userEvent.click(prevButton);

      await waitFor(() => {
        expect(postsApi.getPosts).toHaveBeenLastCalledWith(1, 10);
        expect(screen.getByText('Page 1 Post')).toBeInTheDocument();
      });
    });

    it('should display loading state when changing pages', async () => {
      const mockPage1 = {
        items: [
          {
            id: 1,
            title: 'Page 1 Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts)
        .mockResolvedValueOnce(mockPage1)
        .mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Page 1 Post')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await userEvent.click(nextButton);

      expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    it('should not go below page 1', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /Previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should not exceed total pages', async () => {
      const mockPage1 = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      const mockPage2 = {
        items: [
          {
            id: 2,
            title: 'Post 2',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user2', name: 'Jane Smith', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 2,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
        expect(nextButton).toBeDisabled();
      });
    });
  });

  describe('API Integration', () => {
    it('should call postsApi.getPosts on component mount', async () => {
      const mockResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(postsApi.getPosts).toHaveBeenCalled();
      });
    });

    it('should call API with default pagination (page=1, limit=10)', async () => {
      const mockResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(postsApi.getPosts).toHaveBeenCalledWith(1, 10);
      });
    });

    it('should fetch posts when page changes', async () => {
      const mockPage1 = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      const mockPage2 = {
        items: [
          {
            id: 2,
            title: 'Post 2',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user2', name: 'Jane Smith', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 2,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      renderPostsList();

      await waitFor(() => {
        expect(postsApi.getPosts).toHaveBeenCalledWith(1, 10);
      });

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(postsApi.getPosts).toHaveBeenCalledWith(2, 10);
      });
    });

    it('should update posts state with API response items', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Test Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Test Post')).toBeInTheDocument();
      });
    });

    it('should update totalPages with API response metadata', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 50,
          currentPage: 1,
          pageSize: 10,
          totalPages: 5,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates with short month name', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
      });
    });

    it('should not include time in post card dates', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const dateText = screen.getByText(/Jan 15, 2025/);
        expect(dateText.textContent).not.toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
      });
    });

    it('should handle ISO date strings from API', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-12-25T10:45:30Z',
            updatedAt: '2025-12-25T10:45:30Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText(/Dec 25, 2025/)).toBeInTheDocument();
      });
    });
  });

  describe('Content Truncation', () => {
    it('should truncate content to 200 characters by default', async () => {
      const longText = 'A'.repeat(250);
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: `<p>${longText}</p>`,
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const excerpt = screen.getByText(/A{100,200}\.\.\./);
        expect(excerpt.textContent?.length).toBeLessThanOrEqual(203);
      });
    });

    it('should add ellipsis after truncated content', async () => {
      const longText = 'A'.repeat(250);
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: `<p>${longText}</p>`,
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const excerpt = screen.getByText(/\.\.\./);
        expect(excerpt.textContent).toContain('...');
      });
    });

    it('should strip HTML tags from content', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>This is <strong>bold</strong> text</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const excerpt = screen.getByText(/This is bold text/);
        expect(excerpt.innerHTML).not.toContain('<strong>');
      });
    });

    it('should handle content with nested HTML elements', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content:
              '<div><p>Text with <span><em>nested</em></span> elements</p></div>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const excerpt = screen.getByText(/Text with nested elements/);
        expect(excerpt.textContent).toBe('Text with nested elements');
      });
    });

    it('should handle empty content', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post')).toBeInTheDocument();
      });
    });
  });

  describe('Hover Effects', () => {
    it('should apply hover styles to post cards', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const postCard = document.querySelector('.post-card');
        expect(postCard).toBeInTheDocument();
        expect(postCard).toHaveClass('post-card');
      });
    });

    it('should change title color on hover', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const titleLink = screen.getByText('Post').closest('a');
        expect(titleLink).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should use semantic article tags for posts', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(document.querySelector('article.post-card')).toBeInTheDocument();
      });
    });

    it('should have alt text for post images', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post with Image',
            content: '<p>Content</p>',
            imageUrl: 'https://example.com/image.jpg',
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const image = screen.getByAltText('Post with Image');
        expect(image).toHaveAttribute('alt', 'Post with Image');
      });
    });

    it('should have alt text for avatar images', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: {
              id: 'user1',
              name: 'John Doe',
              avatar: 'https://example.com/avatar.jpg',
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

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toHaveAttribute('alt', 'John Doe');
      });
    });

    it('should have disabled state properly indicated on buttons', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 20,
          currentPage: 1,
          pageSize: 10,
          totalPages: 2,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Previous/i });
        expect(prevButton).toBeDisabled();
        expect(prevButton).toHaveAttribute('disabled');
      });
    });

    it('should use h1 for page title', async () => {
      const mockResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: 'All Posts' }),
        ).toBeInTheDocument();
      });
    });

    it('should use h2 for post titles', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Test Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 2, name: 'Test Post' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply responsive grid classes', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        const grid = document.querySelector('.posts-grid');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass('posts-grid');
      });
    });

    it('should render properly with many posts', async () => {
      const mockPosts = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Post ${i + 1}`,
        content: '<p>Content</p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 0,
        author: { id: `user${i + 1}`, name: `User ${i + 1}`, avatar: null },
      }));

      const mockResponse = {
        items: mockPosts,
        metadata: {
          totalItems: 10,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
        expect(screen.getByText('Post 10')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle posts with very long titles', async () => {
      const longTitle = 'A'.repeat(200);
      const mockResponse = {
        items: [
          {
            id: 1,
            title: longTitle,
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText(longTitle)).toBeInTheDocument();
      });
    });

    it('should handle posts with zero comments', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('0 comments')).toBeInTheDocument();
      });
    });

    it('should handle missing author data gracefully', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: '', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post')).toBeInTheDocument();
      });
    });

    it('should handle posts without images', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            title: 'Post without Image',
            content: '<p>Content</p>',
            imageUrl: null,
            isPublished: true,
            created_at: '2025-01-15T15:30:00Z',
            updatedAt: '2025-01-15T15:30:00Z',
            commentCount: 0,
            author: { id: 'user1', name: 'John Doe', avatar: null },
          },
        ],
        metadata: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      vi.mocked(postsApi.getPosts).mockResolvedValue(mockResponse);

      renderPostsList();

      await waitFor(() => {
        expect(screen.getByText('Post without Image')).toBeInTheDocument();
        expect(
          document.querySelector('.post-card-image'),
        ).not.toBeInTheDocument();
      });
    });
  });
});
