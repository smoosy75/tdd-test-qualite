import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { postsApi } from '../services/posts';
import Comments from './Comments';
import type { Post } from '../types';
import '../assets/css/PostDetail.css';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const postData = await postsApi.getPostById(Number(id));
        setPost(postData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail-error">
        <h2>Error</h2>
        <p>{error || 'Post not found'}</p>
        <Link to="/posts" className="back-link">
          Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <Link to="/posts" className="back-link">
        ← Back to Posts
      </Link>

      <article className="post-detail">
        <header className="post-detail-header">
          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta">
            <div className="post-author-info">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="post-author-avatar"
                />
              ) : (
                <div className="post-author-avatar-placeholder">
                  {post.author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="post-author-details">
                <span className="post-author-name">{post.author.name}</span>
                <div className="post-dates">
                  <span className="post-date">
                    Created: {formatDate(post.created_at)}
                  </span>
                  {post.created_at !== post.updatedAt && (
                    <span className="post-date post-updated">
                      Updated: {formatDate(post.updatedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="post-stats">
              <span className="comment-count">
                {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </div>
        </header>

        {post.imageUrl && (
          <div className="post-detail-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}

        <div
          className="post-detail-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <section className="post-comments-section">
        <Comments postId={post.id} />
      </section>
    </div>
  );
}
