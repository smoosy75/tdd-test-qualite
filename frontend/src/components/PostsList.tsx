import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { postsApi } from '../services/posts';
import type { Post } from '../types';
import '../assets/css/PostsList.css';

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await postsApi.getPosts(page, 10);
        setPosts(response.items);
        setTotalPages(response.metadata.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, retryCount]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const truncateContent = (html: string, maxLength: number = 200) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  if (loading) {
    return (
      <div className="posts-loading">
        <div className="spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="posts-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => {
            setPage(1);
            setRetryCount((prev) => prev + 1);
          }}
          className="retry-btn"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <header className="posts-header">
        <h1>All Posts</h1>
        <p>Discover and read the latest posts from our community</p>
      </header>

      {posts.length === 0 ? (
        <div className="posts-empty">
          <h2>No Posts Found</h2>
          <p>There are no posts to display yet.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              {post.imageUrl && (
                <Link to={`/posts/${post.id}`} className="post-card-image-link">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="post-card-image"
                  />
                </Link>
              )}

              <div className="post-card-content">
                <Link to={`/posts/${post.id}`} className="post-card-title-link">
                  <h2 className="post-card-title">{post.title}</h2>
                </Link>

                <p className="post-card-excerpt">
                  {truncateContent(post.content)}
                </p>

                <div className="post-card-footer">
                  <div className="post-card-author">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="post-card-avatar"
                      />
                    ) : (
                      <div className="post-card-avatar-placeholder">
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="post-card-author-info">
                      <span className="post-card-author-name">
                        {post.author.name}
                      </span>
                      <span className="post-card-date">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="post-card-meta">
                    <span className="post-card-comments">
                      {post.commentCount}{' '}
                      {post.commentCount === 1 ? 'comment' : 'comments'}
                    </span>
                  </div>
                </div>

                <Link to={`/posts/${post.id}`} className="post-card-read-more">
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="posts-pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
