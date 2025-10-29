import express from "express";
import { PostsController } from "../controllers/posts.controller";
import PostService from "../services/postService";
import { CommentService } from "../services/commentService";
import pool from "../services/db";

const router = express.Router();
const comment = new CommentService(pool);
const postsService = new PostService(pool, comment)
const { fetchPosts, fetchPostById } = new PostsController(postsService);

/**
 * GET /api/posts
 */
router.get("/", fetchPosts);

/**
 * GET /api/posts/:id
 */
router.get("/:id", fetchPostById);

export default router;
