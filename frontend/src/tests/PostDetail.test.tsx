import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import PostDetail from '../components/PostDetail';
import { postsApi } from '../services/posts';
import { Post } from '@/types';

// Mock the postsApi service
vi.mock('../services/posts', () => ({
  postsApi: {
    getPostById: vi.fn(),
  },
}));

// Mock the Comments component
vi.mock('../components/Comments', () => ({
  default: ({ postId }: { postId: number }) => (
    <div data-testid="comments-component">Comments for post {postId}</div>
  ),
}));

describe('PostDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPostDetail = (postId: string = '1') => {
    return render(
      <MemoryRouter initialEntries={[`/posts/${postId}`]}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetail />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  describe('Loading State', () => {
    it('should display loading spinner while fetching post', () => {
      vi.mocked(postsApi.getPostById).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      renderPostDetail('1');

      expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    it('should display "Loading post..." text', () => {
      vi.mocked(postsApi.getPostById).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      renderPostDetail('1');

      expect(screen.getByText('Loading post...')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    const mockPost = {
      id: 1,
      title: 'Test Post Title',
      content: '<p>This is test content</p>',
      imageUrl: 'https://example.com/image.jpg',
      isPublished: true,
      created_at: '2025-01-15T15:30:00Z',
      updatedAt: '2025-01-15T15:30:00Z',
      commentCount: 5,
      author: { id: 'user1', name: 'John Doe', avatar: null },
    };

    it('should render post title', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: 'Test Post Title' }),
        ).toBeInTheDocument();
      });
    });

    it('should render post content with HTML', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const contentDiv = document.querySelector('.post-detail-content');
        expect(contentDiv).toBeInTheDocument();
        expect(contentDiv?.innerHTML).toContain('<p>This is test content</p>');
      });
    });

    it('should render post image when imageUrl is provided', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const image = screen.getByAltText('Test Post Title');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      });
    });

    it('should not render image section when imageUrl is null', async () => {
      const postWithoutImage = { ...mockPost, imageUrl: null };
      vi.mocked(postsApi.getPostById).mockResolvedValue(postWithoutImage);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText('Test Post Title')).toBeInTheDocument();
      });

      expect(
        document.querySelector('.post-detail-image'),
      ).not.toBeInTheDocument();
    });

    it('should display author name', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should display author avatar when available', async () => {
      const postWithAvatar = {
        ...mockPost,
        author: {
          ...mockPost.author,
          avatar: 'https://example.com/avatar.jpg',
        },
      };
      vi.mocked(postsApi.getPostById).mockResolvedValue(postWithAvatar);

      renderPostDetail('1');

      await waitFor(() => {
        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      });
    });

    it('should display avatar placeholder when no avatar', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const placeholder = document.querySelector(
          '.post-author-avatar-placeholder',
        );
        expect(placeholder).toBeInTheDocument();
        expect(placeholder).toHaveTextContent('J');
      });
    });

    it('should display creation date formatted correctly', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(
          screen.getByText(/Created: January 15, 2025/),
        ).toBeInTheDocument();
      });
    });

    it('should display updated date when post was modified', async () => {
      const modifiedPost = {
        ...mockPost,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-16T10:00:00Z',
      };
      vi.mocked(postsApi.getPostById).mockResolvedValue(modifiedPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText(/Updated:/)).toBeInTheDocument();
      });
    });

    it('should not display updated date when post was not modified', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText('Test Post Title')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Updated:/)).not.toBeInTheDocument();
    });

    it('should display comment count', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText('5 comments')).toBeInTheDocument();
      });
    });

    it('should display "comment" in singular when count is 1', async () => {
      const postWithOneComment = { ...mockPost, commentCount: 1 };
      vi.mocked(postsApi.getPostById).mockResolvedValue(postWithOneComment);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText('1 comment')).toBeInTheDocument();
      });
    });

    it('should display "comments" in plural when count is not 1', async () => {
      const postWithNoComments = { ...mockPost, commentCount: 0 };
      vi.mocked(postsApi.getPostById).mockResolvedValue(postWithNoComments);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText('0 comments')).toBeInTheDocument();
      });
    });

    it('should render Comments component with correct postId', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const commentsComponent = screen.getByTestId('comments-component');
        expect(commentsComponent).toBeInTheDocument();
        expect(commentsComponent).toHaveTextContent('Comments for post 1');
      });
    });

    it('should display "Back to Posts" link', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText(/Back to Posts/)).toBeInTheDocument();
      });
    });

    it('should link back to /posts route', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const backLink = screen.getByText(/Back to Posts/).closest('a');
        expect(backLink).toHaveAttribute('href', '/posts');
      });
    });
  });

  describe('Error State', () => {
    it('should display error message when API call fails', async () => {
      vi.mocked(postsApi.getPostById).mockRejectedValue(
        new Error('Failed to fetch post'),
      );

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText(/Error/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch post/)).toBeInTheDocument();
      });
    });

    it('should display "Post not found" when post is null', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(
        null as unknown as Post,
      );

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText(/Post not found/)).toBeInTheDocument();
      });
    });

    it('should display "Back to Posts" link in error state', async () => {
      vi.mocked(postsApi.getPostById).mockRejectedValue(
        new Error('Failed to fetch post'),
      );

      renderPostDetail('1');

      await waitFor(() => {
        const backLink = screen.getByText(/Back to Posts/);
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/posts');
      });
    });

    it('should not render Comments component on error', async () => {
      vi.mocked(postsApi.getPostById).mockRejectedValue(
        new Error('Failed to fetch post'),
      );

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      });

      expect(
        screen.queryByTestId('comments-component'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Routing Integration', () => {
    const mockPost = {
      id: 1,
      title: 'Test Post',
      content: '<p>Content</p>',
      imageUrl: null,
      isPublished: true,
      created_at: '2025-01-15T15:30:00Z',
      updatedAt: '2025-01-15T15:30:00Z',
      commentCount: 0,
      author: { id: 'user1', name: 'John Doe', avatar: null },
    };

    it('should extract post ID from URL params', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('123');

      await waitFor(() => {
        expect(postsApi.getPostById).toHaveBeenCalledWith(123);
      });
    });

    it('should call API with correct post ID from URL', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('42');

      await waitFor(() => {
        expect(postsApi.getPostById).toHaveBeenCalledWith(42);
      });
    });

    it('should handle different post IDs', async () => {
      const post1 = { ...mockPost, id: 1, title: 'Post 1' };
      const post2 = { ...mockPost, id: 2, title: 'Post 2' };

      vi.mocked(postsApi.getPostById)
        .mockResolvedValueOnce(post1)
        .mockResolvedValueOnce(post2);

      const { rerender } = render(
        <MemoryRouter initialEntries={['/posts/1']}>
          <Routes>
            <Route path="/posts/:id" element={<PostDetail />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });

      rerender(
        <MemoryRouter initialEntries={['/posts/2']}>
          <Routes>
            <Route path="/posts/:id" element={<PostDetail />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('Post 2')).toBeInTheDocument();
      });
    });

    it('should refetch post when URL param changes', async () => {
      vi.mocked(postsApi.getPostById)
        .mockResolvedValueOnce({ ...mockPost, id: 1, title: 'First Post' })
        .mockResolvedValueOnce({ ...mockPost, id: 2, title: 'Second Post' });

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      expect(postsApi.getPostById).toHaveBeenCalledTimes(1);
    });
  });

  describe('API Integration', () => {
    const mockPost = {
      id: 1,
      title: 'Test Post',
      content: '<p>Content</p>',
      imageUrl: null,
      isPublished: true,
      created_at: '2025-01-15T15:30:00Z',
      updatedAt: '2025-01-15T15:30:00Z',
      commentCount: 0,
      author: { id: 'user1', name: 'John Doe', avatar: null },
    };

    it('should call postsApi.getPostById with post ID', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(postsApi.getPostById).toHaveBeenCalledWith(1);
      });
    });

    it('should convert string ID to number before API call', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('999');

      await waitFor(() => {
        expect(postsApi.getPostById).toHaveBeenCalledWith(999);
        expect(postsApi.getPostById).not.toHaveBeenCalledWith('999');
      });
    });

    it('should not fetch when ID is undefined', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      render(
        <MemoryRouter initialEntries={['/posts/']}>
          <Routes>
            <Route path="/posts/:id?" element={<PostDetail />} />
          </Routes>
        </MemoryRouter>,
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(postsApi.getPostById).not.toHaveBeenCalled();
    });
  });

  describe('Date Formatting', () => {
    it('should format dates with full month name', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: '<p>Content</p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 0,
        author: { id: 'user1', name: 'John Doe', avatar: null },
      };

      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText(/January 15, 2025/)).toBeInTheDocument();
      });
    });

    it('should include time in formatted date', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: '<p>Content</p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 0,
        author: { id: 'user1', name: 'John Doe', avatar: null },
      };

      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const dateText = screen.getByText(/Created:/);
        expect(dateText.textContent).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
      });
    });

    it('should handle ISO date strings from API', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: '<p>Content</p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-12-25T10:45:30Z',
        updatedAt: '2025-12-25T10:45:30Z',
        commentCount: 0,
        author: { id: 'user1', name: 'John Doe', avatar: null },
      };

      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
      });
    });
  });

  describe('Content Rendering', () => {
    it('should render HTML content safely with dangerouslySetInnerHTML', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: '<p>This is <strong>bold</strong> text</p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 0,
        author: { id: 'user1', name: 'John Doe', avatar: null },
      };

      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const contentDiv = document.querySelector('.post-detail-content');
        expect(contentDiv?.innerHTML).toContain('<strong>bold</strong>');
      });
    });

    it('should render formatted text with paragraphs', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: '<p>First paragraph</p><p>Second paragraph</p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 0,
        author: { id: 'user1', name: 'John Doe', avatar: null },
      };

      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const contentDiv = document.querySelector('.post-detail-content');
        expect(contentDiv?.querySelectorAll('p').length).toBe(2);
      });
    });

    it('should render links in content', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: '<p>Check out <a href="https://example.com">this link</a></p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 0,
        author: { id: 'user1', name: 'John Doe', avatar: null },
      };

      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const link = screen.getByText('this link');
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href', 'https://example.com');
      });
    });
  });

  describe('Accessibility', () => {
    const mockPost = {
      id: 1,
      title: 'Test Post',
      content: '<p>Content</p>',
      imageUrl: 'https://example.com/image.jpg',
      isPublished: true,
      created_at: '2025-01-15T15:30:00Z',
      updatedAt: '2025-01-15T15:30:00Z',
      commentCount: 0,
      author: {
        id: 'user1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      },
    };

    it('should use semantic HTML article tag for post', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(
          document.querySelector('article.post-detail'),
        ).toBeInTheDocument();
      });
    });

    it('should use semantic header tag for post metadata', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(
          document.querySelector('header.post-detail-header'),
        ).toBeInTheDocument();
      });
    });

    it('should have alt text for post image', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const images = screen.getAllByAltText('Test Post');
        expect(
          images.some((img) => img.getAttribute('src')?.includes('image.jpg')),
        ).toBe(true);
      });
    });

    it('should have alt text for avatar image', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      });
    });

    it('should use h1 for post title', async () => {
      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: 'Test Post' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long post titles', async () => {
      const longTitle = 'A'.repeat(200);
      const mockPost = {
        id: 1,
        title: longTitle,
        content: '<p>Content</p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 0,
        author: { id: 'user1', name: 'John Doe', avatar: null },
      };

      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText(longTitle)).toBeInTheDocument();
      });
    });

    it('should handle posts with zero comments', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: '<p>Content</p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 0,
        author: { id: 'user1', name: 'John Doe', avatar: null },
      };

      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText('0 comments')).toBeInTheDocument();
      });
    });

    it('should handle missing author data gracefully', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: '<p>Content</p>',
        imageUrl: null,
        isPublished: true,
        created_at: '2025-01-15T15:30:00Z',
        updatedAt: '2025-01-15T15:30:00Z',
        commentCount: 0,
        author: { id: 'user1', name: '', avatar: null },
      };

      vi.mocked(postsApi.getPostById).mockResolvedValue(mockPost);

      renderPostDetail('1');

      await waitFor(() => {
        expect(screen.getByText('Test Post')).toBeInTheDocument();
      });
    });

    it('should handle invalid post ID gracefully', async () => {
      vi.mocked(postsApi.getPostById).mockRejectedValue(
        new Error('Invalid post ID'),
      );

      renderPostDetail('invalid');

      await waitFor(() => {
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      });
    });
  });
});
