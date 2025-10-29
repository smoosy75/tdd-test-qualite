import express from "express";
import { CommentsController } from "../controllers/comments.controller";
import { CommentService } from "../services/commentService";
import pool from "../services/db";

const router = express.Router();

const commentService = new CommentService(pool);
const { fetchCommentsByPost } = new CommentsController(commentService);

/**
 * GET /api/comments/:postId?page=1&limit=10
 */
router.get("/:postId", fetchCommentsByPost);

export default router;
