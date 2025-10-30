import express from 'express';
import { CommentsController } from '../controllers/comments.controller';
import { CommentService } from '../services/commentService';
import pool from '../services/db';
import { UserService } from '../services/userService';
import pb from '../services/pb';

const router = express.Router();

const commentService = new CommentService(pool);
const userService = new UserService(pb);

/**
 * GET /api/comments/:postId?page=1&limit=10
 */
router.get('/:postId', (res, req) => {
  const commentsController = new CommentsController(
    commentService,
    userService
  );
  return commentsController.fetchCommentsByPost(res, req);
});

export default router;
