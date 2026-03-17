import { ICommentService } from './commentService';
import type { Page, Post } from '../types';
import sanitizeHtml from 'sanitize-html';
import { Pool } from 'pg';

export interface IPostService {
  getPosts(options?: GetPostsOptions): Promise<Page<Post>>;
  getPostById(postId: number, include: string[]): Promise<Post | null>;
}

export interface GetPostsOptions {
  page?: number;
  limit?: number;
  authorId?: number;
  tags?: string[];
  search?: string;
  sortBy?: 'created_at' | 'title';
  sortOrder?: 'asc' | 'desc';
  include?: string[]; // e.g., ['comments', 'author']
  fields?: string[]; // specific post fields to return
}

const MAX_PAGE_SIZE = 50;

export class PostService implements IPostService {
  constructor(
    private db: Pool,
    private commentService: ICommentService
  ) {}

  async getPosts(options: GetPostsOptions = {}): Promise<Page<Post>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = Math.min(options.limit || 10, MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;

    const client = await this.db.connect();
    try {
      // Build base query
      let baseQuery = 'SELECT * FROM app.posts WHERE 1=1';
      const queryParams: any[] = [];

      // Filters
      if (options.authorId) {
        queryParams.push(options.authorId);
        baseQuery += ` AND user_id = $${queryParams.length}`;
      }

      if (options.search) {
        queryParams.push(`%${options.search}%`);
        baseQuery += ` AND (title ILIKE $${queryParams.length} OR content ILIKE $${queryParams.length})`;
      }

      // Total count
      const countResult = await client.query(
        `SELECT COUNT(*) AS total FROM (${baseQuery}) AS filtered_posts`,
        queryParams
      );
      const total = parseInt(countResult.rows[0].total, 10);
      const totalPages = Math.ceil(total / limit);

      // Sorting
      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder === 'asc' ? 'ASC' : 'DESC';

      // Fetch posts
      queryParams.push(limit, offset);
      const postsResult = await client.query(
        `${baseQuery} ORDER BY ${sortBy} ${sortOrder} LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
        queryParams
      );

      // Map posts
      const posts = await Promise.all(
        postsResult.rows.map(async (post: Post) => {
          const sanitizedContent = sanitizeHtml(post.content);

          const commentCount =
            await this.commentService.getCommentCountByPostId(post.id);

          // Pick only requested fields if specified
          const postData: Post = {
            id: post.id,
            title: post.title,
            content: sanitizedContent,
            isPublished: post.isPublished,
            imageUrl: post.imageUrl,
            created_at: post.created_at,
            updatedAt: post.updatedAt,
            user_id: post.user_id,
            commentCount,
          };

          if (options.fields) {
            return options.fields.reduce((acc: any, field) => {
              if (field in postData) acc[field] = postData[field];
              return acc;
            }, {});
          }

          return postData;
        })
      );

      return {
        items: posts,
        total,
        page,
        totalPages,
      };
    } catch (err) {
      console.error('Error fetching posts:', err);
      throw new Error('Database error');
    } finally {
      client.release();
    }
  }

  /**
   * Fetch a single post by ID, optionally including comments
   */
  async getPostById(postId: number): Promise<Post | null> {
    const client = await this.db.connect();
    try {
      const postResult = await client.query(
        'SELECT * FROM app.posts WHERE id = $1',
        [postId]
      );
      if (!postResult.rowCount) return null;

      const post = postResult.rows[0];

      const sanitizedContent = sanitizeHtml(post.content);

      const commentCount = await this.commentService.getCommentCountByPostId(
        post.id
      );

      return {
        id: post.id,
        title: post.title,
        content: sanitizedContent,
        isPublished: post.is_published,
        created_at: post.created_at,
        updatedAt: post.updated_at,
        user_id: post.user_id,
        imageUrl: post.image_url,
        commentCount,
      };
    } catch (err) {
      console.error('Error fetching post by ID:', err);
      throw new Error('Database error');
    } finally {
      client.release();
    }
  }
}

export default PostService;
