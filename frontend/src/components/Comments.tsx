import { useState, useEffect } from 'react';
import { postsApi } from '../services/posts';
import type { Comment } from '../types';
import '../assets/css/Comments.css';

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await postsApi.getCommentsByPostId(postId, page, 10);
        setComments(response.items);
        setTotalPages(response.metadata.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load comments',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="comments-loading">
        <div className="spinner"></div>
        <p>Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comments-error">
        <p>Error: {error}</p>
        <button onClick={() => setPage(1)}>Try Again</button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="comments-empty">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="comments-container">
      <h3 className="comments-title">Comments ({comments.length})</h3>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-card">
            <div className="comment-header">
              <div className="comment-author">
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="comment-avatar"
                  />
                ) : (
                  <div className="comment-avatar-placeholder">
                    {comment.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="comment-author-info">
                  <span className="comment-author-name">
                    {comment.author.name}
                  </span>
                  <span className="comment-date">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
              </div>
              {comment.created_at !== comment.updated_at && (
                <span className="comment-edited">
                  Edited: {formatDate(comment.updated_at)}
                </span>
              )}
            </div>

            <div className="comment-content">
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="comments-pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
