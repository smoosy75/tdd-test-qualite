import { Page } from '../types';
import type { Comment } from '../types';
import { Pool } from 'pg';

export interface ICommentService {
  getCommentsByPostId(
    postId: number,
    page?: number,
    limit?: number,
    sortOptions?: SortOptions,
    filters?: FilterOptions
  ): Promise<Page<Comment>>;
  getCommentCountByPostId(postId: number): Promise<number>;
}

export interface FilterOptions {
  authorId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  sort: 'asc' | 'desc';
  sortField: 'createdAt' | 'updatedAt' | 'likes';
}

export class CommentService implements ICommentService {
  constructor(private db: Pool) {}

  private getSortColumn(field: string): string {
    const columnMap: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      likes: 'likes',
    };

    return columnMap[field] || 'created_at';
  }

  async getCommentsByPostId(
    postId: number,
    page = 1,
    limit = 10,
    sortOptions?: SortOptions,
    filters?: FilterOptions
  ): Promise<Page<Comment>> {
    const offset = (page - 1) * limit;
    const client = await this.db.connect();
    const params: any[] = [postId];
    let whereClause = 'WHERE post_id = $1';

    try {
      // Add author filter
      if (filters?.authorId) {
        params.push(filters.authorId);
        whereClause += ` AND user_id = $${params.length}`;
      }

      // Add date range filter
      if (filters?.dateRange) {
        params.push(filters.dateRange.start);
        params.push(filters.dateRange.end);
        whereClause += ` AND created_at >= $${params.length - 1} AND created_at <= $${params.length}`;
      }

      // Get total filtered comments
      const countResult = await client.query(
        `SELECT COUNT(*)::int AS total FROM app.comments ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total, 10);
      const totalPages = Math.ceil(total / limit);

      // Build sort clause
      const sortColumn = this.getSortColumn(
        sortOptions?.sortField || 'createdAt'
      );
      const sortOrder = (sortOptions?.sort || 'desc').toUpperCase();

      // Add pagination params
      params.push(limit, offset);

      // Fetch filtered comments
      const result = await client.query<Comment>(
        `SELECT * FROM app.comments 
         ${whereClause}
         ORDER BY ${sortColumn} ${sortOrder}
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );

      return {
        items: result.rows,
        total,
        page,
        totalPages,
      };
    } finally {
      client.release();
    }
  }

  async getCommentCountByPostId(postId: number): Promise<number> {
    const result = await this.db.query(
      `SELECT count(*) as count FROM app.comments 
         where post_id = $1`,
      [postId]
    );

    return parseInt(result.rows[0].count, 10);
  }
}
