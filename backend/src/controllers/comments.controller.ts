import { Request, Response } from 'express';
import {
  FilterOptions,
  ICommentService,
  SortOptions,
} from '../services/commentService';
import { IUserService } from '../services/userService';

export class CommentsController {
  constructor(
    private commentService: ICommentService,
    private userService: IUserService
  ) {}

  /**
   * Controller: Fetch paginated comments for a specific post
   */
  async fetchCommentsByPost(req: Request, res: Response) {
    const postId = parseInt(req.params.postId, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid postId' });
    }

    const page =
      typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1;
    if (isNaN(page) || page < 1) {
      return res
        .status(400)
        .json({ error: 'Invalid page number. Must be a positive integer' });
    }

    const limit =
      typeof req.query.size === 'string' ? parseInt(req.query.size, 10) : 10;
    if (isNaN(limit) || limit < 1) {
      return res
        .status(400)
        .json({ error: 'Invalid size parameter. Must be a positive integer' });
    }

    const filters: FilterOptions = {};

    if (req.query.authorId) {
      filters.authorId = req.query.authorId as string;
    }

    if (req.query.startDate && req.query.endDate) {
      const start = new Date(req.query.startDate as string);
      const end = new Date(req.query.endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date range format' });
      }

      filters.dateRange = { start, end };
    }

    const sort =
      typeof req.query.sort === 'string'
        ? req.query.sort.toLowerCase()
        : 'desc';
    const sortField =
      typeof req.query.sortField === 'string'
        ? req.query.sortField
        : 'createdAt';

    const allowedSortOrders = ['asc', 'desc'];
    const allowedSortFields = ['createdAt', 'updatedAt', 'likes'];

    if (!allowedSortOrders.includes(sort)) {
      return res
        .status(400)
        .json({ error: "Invalid sort order. Use 'asc' or 'desc'" });
    }

    if (!allowedSortFields.includes(sortField)) {
      return res.status(400).json({
        error:
          'Invalid sort field. Allowed fields: createdAt, updatedAt, likes',
      });
    }

    try {
      const commentsData = await this.commentService.getCommentsByPostId(
        postId,
        page,
        limit,
        { sort, sortField } as SortOptions,
        filters
      );

      // If no comments found, return empty result with metadata
      if (commentsData.items.length <= 0) {
        return res.json({
          items: [],
          total: 0,
          page,
          totalPages: 0,
          message: `No comments found for post ${postId}`,
        });
      }

      // Extract unique user IDs from comments
      const userIds = [
        ...new Set(commentsData.items.map((comment) => comment.user_id)),
      ];

      // Batch fetch user profiles
      const userProfiles = await this.userService.getUsersByIds(userIds);

      // Create a map for quick user lookup
      const userMap = new Map(userProfiles.map((user) => [user.id, user]));

      // Enrich comments with user data
      const enrichedComments = commentsData.items.map((comment) => ({
        ...comment,
        author: userMap.get(comment.user_id)
          ? {
              id: userMap.get(comment.user_id)!.id,
              name: userMap.get(comment.user_id)!.name,
              avatar: userMap.get(comment.user_id)!.avatar,
            }
          : {
              id: 'deleted',
              name: 'Deleted User',
              avatar: 'default-avatar.png',
            },
      }));

      res.json({
        items: enrichedComments,
        metadata: {
          totalItems: commentsData.total,
          currentPage: page,
          pageSize: limit,
          totalPages: commentsData.totalPages,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }
}
