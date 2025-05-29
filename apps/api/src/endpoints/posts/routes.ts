import express from "express";
import { requireAuth } from "@api/common/middleware/jwtToken";
import {
	createPost,
	toggleLikePost,
	commentOnPost,
	getFeed,
	getFeedFromFollowing,
	getUserPosts,
} from "./controller";

const postsRouter = express.Router();

postsRouter.use(requireAuth);

// Posts
postsRouter.post("/", createPost); // Create a new post
postsRouter.post("/:postId/like", toggleLikePost); // Like/unlike a post
postsRouter.post("/:postId/comment", commentOnPost); // Comment on a post

// Feeds
postsRouter.get("/feed", getFeed); // Global feed (all posts)
postsRouter.get("/feed/following", getFeedFromFollowing); // Feed from followed users

// User posts
postsRouter.get("/user/:userId", getUserPosts); // Get posts by user

export default postsRouter;
