import { Request, Response } from "express";
import { IPostService } from "../services/postService";
import { IUserService } from "../services/userService";

export class PostsController {

  constructor(
    private postService: IPostService, 
    private userService: IUserService ) {}

  /**
   * Controller: Fetch paginated list of posts with optional filters, include/exclude, and fields selection
   */
  async fetchPosts(req: Request, res: Response) {
    try {
      const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
      const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 10;
      const authorId = typeof req.query.authorId === "string" ? parseInt(req.query.authorId, 10) : undefined;
      const search = typeof req.query.search === "string" ? req.query.search : undefined;

      // include related entities: e.g., include=comments,author
      const include = typeof req.query.include === "string"
        ? req.query.include.split(",").map((s) => s.trim())
        : [];

      // fields to return: e.g., fields=id,title,content
      const fields = typeof req.query.fields === "string"
        ? req.query.fields.split(",").map((s) => s.trim())
        : undefined;

      // Validation
      if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
        return res.status(400).json({ error: "Invalid pagination parameters" });
      }

      const data = await this.postService.getPosts({ page, limit, authorId, search, include, fields });

      // Handle empty results early
      if (!data.items.length) {
        return res.json({
          items: [],
          metadata: {
            totalItems: 0,
            currentPage: page,
            pageSize: limit,
            totalPages: 0
          }
        });
      }

      // Get unique author IDs from all posts
      const authorIds = [...new Set(data.items.map(post => post.user_id))];

      // Batch fetch all authors
      const authors = await this.userService.getUsersByIds(authorIds);
      const authorMap = new Map(authors.map(author => [author.id, author]));

      // Enrich posts with author data
      const enrichedPosts = data.items.map(({ user_id, ...post }) => ({
        ...post,
        author: authorMap.get(user_id) ? {
          id: authorMap.get(user_id)!.id,
          name: authorMap.get(user_id)!.name,
          avatar: authorMap.get(user_id)!.avatar
        } : {
          id: 'deleted',
          name: 'Deleted User',
          avatar: 'default-avatar.png'
        }
      }));

      res.json({
        items: enrichedPosts,
        metadata: {
          totalItems: data.total,
          currentPage: page,
          pageSize: limit,
          totalPages: data.totalPages
        }
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  };

  /**
   * Controller: Fetch single post by ID with optional include=comments,author
   */
  async fetchPostById(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id, 10);
      if (isNaN(postId)) 
        return res.status(400).json({ error: "Invalid post ID" });

      const include = typeof req.query.include === "string"
        ? req.query.include.split(",").map((s) => s.trim())
        : [];

      const post = await this.postService.getPostById(postId, include);

      if (!post) 
        return res.status(404).json({ error: "Post not found" });

      // Fetch author information
      const author = await this.userService.getUsersByIds([post.user_id]);
      const { user_id, ...postWithoutUserId } = post;
      
      const enrichedPost = {
        ...postWithoutUserId,
        author: author[0] ? {
          id: author[0].id,
          name: author[0].name,
          avatar: author[0].avatar
        } : {
          id: 'deleted',
          name: 'Deleted User',
          avatar: 'default-avatar.png'
        }
      };

      res.json(enrichedPost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  };
}
