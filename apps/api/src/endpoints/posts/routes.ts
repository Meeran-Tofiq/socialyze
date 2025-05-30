import express from "express";
import { requireAuth } from "@api/common/middleware/jwtToken";
import {
	createPost,
	toggleLikePost,
	commentOnPost,
	getFeed,
	getFeedFromFollowing,
	getUserPosts,
	getPostComments,
	deletePost,
} from "./controller";

const postsRouter = express.Router();

postsRouter.use(requireAuth);

// Feeds
postsRouter.get("/feed", getFeed); // Global feed (all posts)
postsRouter.get("/feed/following", getFeedFromFollowing); // Feed from followed users

// User posts
postsRouter.get("/user/:userId", getUserPosts); // Get posts by user

// Posts
postsRouter.post("/", createPost); // Create a new post
postsRouter.post("/:postId/like", toggleLikePost); // Like/unlike a post
postsRouter.post("/:postId/comment", commentOnPost); // Comment on a post
postsRouter.get("/:postId/comments", getPostComments); // get comments of a post
postsRouter.delete("/:postId", deletePost); // delete post

export default postsRouter;
