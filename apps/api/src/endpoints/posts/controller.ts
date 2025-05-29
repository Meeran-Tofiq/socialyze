import { Request, Response } from "express";
import { UserInfo } from "@socialyze/shared";
import UserModel, { UserDoc } from "../me/model";
import PostModel from "./model";
import mongoose from "mongoose";
import logger from "@api/common/logger";

export const createPost = async (req: Request, res: Response) => {
	const authReq = req as Request & { user: UserInfo };
	logger.info(`[createPost] - User ${authReq.user.id} is creating a post`);

	try {
		const { content } = req.body;
		logger.debug(`[createPost] - Content length: ${content?.length}`);

		const authorId = authReq.user.id;

		const newPost = await PostModel.create({ authorId, content, likes: [], comments: [] });
		logger.info(`[createPost] - Post created with id: ${newPost._id}`);

		res.status(201).json(newPost);
	} catch (error) {
		logger.error(`[createPost] - Failed to create post for user ${authReq.user.id}:`, error);
		res.status(500).json({ message: "Failed to create post" });
	}
};

export const toggleLikePost = async (req: Request, res: Response) => {
	const authReq = req as Request & { user: UserInfo };
	const { postId } = req.params;

	logger.info(`[toggleLikePost] - User ${authReq.user.id} toggling like on post ${postId}`);

	try {
		const post = await PostModel.findById(postId);
		if (!post) {
			logger.warn(`[toggleLikePost] - Post not found: ${postId}`);
			return res.status(404).json({ message: "Post not found" });
		}

		const userId = authReq.user.id;
		const userObjectId = new mongoose.Types.ObjectId(userId);
		const liked = post.likes.some((id) => id.equals(userObjectId));

		if (liked) {
			post.likes = post.likes.filter((id) => !id.equals(userObjectId));
			logger.info(`[toggleLikePost] - User ${userId} unliked post ${postId}`);
		} else {
			post.likes.push(userObjectId);
			logger.info(`[toggleLikePost] - User ${userId} liked post ${postId}`);
		}

		await post.save();
		logger.debug(`[toggleLikePost] - Likes count now: ${post.likes.length}`);

		res.json(post);
	} catch (error) {
		logger.error(
			`[toggleLikePost] - Failed to toggle like for user ${authReq.user.id} on post ${postId}:`,
			error,
		);
		res.status(500).json({ message: "Failed to toggle like" });
	}
};

export const commentOnPost = async (req: Request, res: Response) => {
	const authReq = req as Request & { user: UserInfo };
	const { postId } = req.params;
	const { content } = req.body;

	logger.info(`[commentOnPost] - User ${authReq.user.id} commenting on post ${postId}`);

	try {
		const post = await PostModel.findById(postId);
		if (!post) {
			logger.warn(`[commentOnPost] - Post not found: ${postId}`);
			return res.status(404).json({ message: "Post not found" });
		}

		const comment = {
			content,
			authorId: new mongoose.Types.ObjectId(authReq.user.id),
			postId: post._id,
		};

		post.comments.push(comment);
		await post.save();

		const createdComment = post.comments.at(-1);
		logger.info(
			`[commentOnPost] - Comment added by user ${authReq.user.id} with id: ${createdComment?._id}`,
		);

		res.status(201).json(createdComment);
	} catch (error) {
		logger.error(
			`[commentOnPost] - Failed to comment on post ${postId} by user ${authReq.user.id}:`,
			error,
		);
		res.status(500).json({ message: "Failed to comment on post" });
	}
};

export const getFeed = async (req: Request, res: Response) => {
	logger.info(`[getFeed] - Fetching global post feed`);

	try {
		// Parse page and limit query params with defaults
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20)); // max 100 per page

		const skip = (page - 1) * limit;

		const feed = await PostModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

		logger.info(
			`[getFeed] - Retrieved ${feed.length} posts for page ${page} with limit ${limit}`,
		);

		res.json({
			page,
			limit,
			posts: feed,
		});
	} catch (error) {
		logger.error(`[getFeed] - Failed to get feed:`, error);
		res.status(500).json({ message: "Failed to get feed" });
	}
};

export const getFeedFromFollowing = async (req: Request, res: Response) => {
	const authReq = req as Request & { user: UserInfo };
	logger.info(
		`[getFeedFromFollowing] - User ${authReq.user.id} fetching feed from followed users`,
	);

	try {
		const user: UserDoc | null = await UserModel.findById(authReq.user.id);
		if (!user) {
			logger.warn(`[getFeedFromFollowing] - User not found: ${authReq.user.id}`);
			return res.status(404).json({ message: "User not found" });
		}

		logger.debug(`[getFeedFromFollowing] - User follows ${user.following.length} users`);

		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
		const skip = (page - 1) * limit;

		const feed = await PostModel.find({ authorId: { $in: user.following } })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		logger.info(
			`[getFeedFromFollowing] - Retrieved ${feed.length} posts from following for page ${page} with limit ${limit}`,
		);

		res.json({
			page,
			limit,
			posts: feed,
		});
	} catch (error) {
		logger.error(
			`[getFeedFromFollowing] - Failed to get feed for user ${authReq.user.id}:`,
			error,
		);
		res.status(500).json({ message: "Failed to get feed" });
	}
};

export const getUserPosts = async (req: Request, res: Response) => {
	const { userId } = req.params;
	logger.info(`[getUserPosts] - Fetching posts for user ${userId}`);

	try {
		const posts = await PostModel.find({ authorId: userId }).sort({ createdAt: -1 });
		logger.info(`[getUserPosts] - Retrieved ${posts.length} posts for user ${userId}`);

		res.json(posts);
	} catch (error) {
		logger.error(`[getUserPosts] - Failed to get posts for user ${userId}:`, error);
		res.status(500).json({ message: "Failed to get user posts" });
	}
};
