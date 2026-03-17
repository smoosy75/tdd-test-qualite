import express from 'express';
import { PostsController } from '../controllers/posts.controller';
import PostService from '../services/postService';
import { CommentService } from '../services/commentService';
import pool from '../services/db';
import { UserService } from '../services/userService';
import pb from '../services/pb';

const router = express.Router();
const commentsService = new CommentService(pool);
const postsService = new PostService(pool, commentsService);
const userService = new UserService(pb);

/**
 * GET /api/posts
 */
router.get('/', async (req, res) => {
  const controller = new PostsController(postsService, userService);
  return controller.fetchPosts(req, res);
});

/**
 * GET /api/posts/:id
 */
router.get('/:id', async (req, res) => {
  const controller = new PostsController(postsService, userService);
  return controller.fetchPostById(req, res);
});

export default router;
