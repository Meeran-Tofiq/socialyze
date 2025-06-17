import { Request, Response } from "express";
import mongoose from "mongoose";
import { UserInfo, UserPublic } from "@socialyze/shared";
import logger from "@api/common/logger";
import getPublicProfileFromUser from "@api/common/publicUser";

import UserModel from "../me/model";
import PostModel, { PostDoc } from "./model";
import { getPresignedDownloadUrl, deleteMediaByKey } from "../media/service";
import { ObjectId } from "mongodb";

async function enrichPostsWithAuthorInfo(posts: PostDoc[]) {
	const enriched = [];

	// Collect all unique userIds (authors of posts + comments)
	const userIds = new Set<string>();
	for (const post of posts) {
		userIds.add(post.authorId.toString());
		for (const comment of post.comments) {
			userIds.add(comment.authorId.toString());
		}
	}

	// Load all users at once
	const users = await UserModel.find({ _id: { $in: Array.from(userIds) } }).lean();
	const userEntries: [string, UserPublic][] = await Promise.all(
		users.map(async (user): Promise<[string, UserPublic]> => {
			const publicProfile = await getPublicProfileFromUser(user);
			return [user._id.toString(), publicProfile];
		}),
	);
	const userMap = new Map(userEntries);

	for (const post of posts) {
		const authorPublic = userMap.get(post.authorId.toString()) ?? null;

		const enrichedComments = post.comments.map((comment) => ({
			...comment.toObject(),
			author: userMap.get(comment.authorId.toString()) ?? null,
		}));

		// Convert media keys to presigned URLs
		let media: string[] = [];
		if (post.media && Array.isArray(post.media)) {
			media = await Promise.all(
				post.media.map(async (key) => {
					if (key.startsWith("http")) return key; // already a URL, just return
					return getPresignedDownloadUrl(key);
				}),
			);
		}

		enriched.push({
			...post.toObject(),
			author: authorPublic,
			comments: enrichedComments,
			media: media, // overwrite with presigned URLs
		});
	}

	return enriched;
}

export async function createPost(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	logger.info(`[createPost] - User ${authReq.user.id} is creating a post`);

	try {
		const { content, media } = req.body; // expect media array here
		const authorId = authReq.user.id;

		// Validate media is an array if provided
		const mediaKeys = Array.isArray(media) ? media : [];

		const newPost = await PostModel.create({
			authorId,
			content,
			likes: [],
			comments: [],
			media: mediaKeys, // save the keys here
		});

		logger.info(`[createPost] - Post created with id: ${newPost._id}`);

		return res.status(201).json(newPost);
	} catch (error) {
		logger.error(`[createPost] - Failed to create post for user ${authReq.user.id}:`, error);
		return res.status(500).json({ message: "Failed to create post" });
	}
}

export async function toggleLikePost(req: Request, res: Response) {
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

		return res.json(post);
	} catch (error) {
		logger.error(
			`[toggleLikePost] - Failed to toggle like for user ${authReq.user.id} on post ${postId}:`,
			error,
		);
		return res.status(500).json({ message: "Failed to toggle like" });
	}
}

export async function commentOnPost(req: Request, res: Response) {
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

		return res.status(201).json(createdComment);
	} catch (error) {
		logger.error(
			`[commentOnPost] - Failed to comment on post ${postId} by user ${authReq.user.id}:`,
			error,
		);
		return res.status(500).json({ message: "Failed to comment on post" });
	}
}

export async function getFeed(req: Request, res: Response) {
	logger.info(`[getFeed] - Fetching global post feed`);

	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
		const skip = (page - 1) * limit;

		const feed = await PostModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
		const enrichedFeed = await enrichPostsWithAuthorInfo(feed);

		logger.info(
			`[getFeed] - Retrieved ${feed.length} posts for page ${page} with limit ${limit}`,
		);

		return res.json({ page, limit, posts: enrichedFeed });
	} catch (error) {
		logger.error(`[getFeed] - Failed to get feed:`, error);
		return res.status(500).json({ message: "Failed to get feed" });
	}
}

export async function getFeedFromFollowing(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	logger.info(
		`[getFeedFromFollowing] - User ${authReq.user.id} fetching feed from followed users`,
	);

	try {
		const user = await UserModel.findById(authReq.user.id);
		if (!user) {
			logger.warn(`[getFeedFromFollowing] - User not found: ${authReq.user.id}`);
			return res.status(404).json({ message: "User not found" });
		}

		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
		const skip = (page - 1) * limit;

		const feed = await PostModel.find({ authorId: { $in: user.following } })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const enrichedFeed = await enrichPostsWithAuthorInfo(feed);

		logger.info(
			`[getFeedFromFollowing] - Retrieved ${feed.length} posts from following for page ${page} with limit ${limit}`,
		);

		return res.json({ page, limit, posts: enrichedFeed });
	} catch (error) {
		logger.error(
			`[getFeedFromFollowing] - Failed to get feed for user ${authReq.user.id}:`,
			error,
		);
		return res.status(500).json({ message: "Failed to get feed" });
	}
}

export async function getUserPosts(req: Request, res: Response) {
	const { userId } = req.params;
	logger.info(`[getUserPosts] - Fetching posts for user ${userId}`);

	try {
		const posts = await PostModel.find({ authorId: new ObjectId(userId) }).sort({
			createdAt: -1,
		});
		const enrichedPosts = await enrichPostsWithAuthorInfo(posts);

		logger.info(`[getUserPosts] - Retrieved ${posts.length} posts for user ${userId}`);

		return res.json({ posts: enrichedPosts });
	} catch (error) {
		logger.error(`[getUserPosts] - Failed to get posts for user ${userId}:`, error);
		return res.status(500).json({ message: "Failed to get user posts" });
	}
}

export async function getPostComments(req: Request, res: Response) {
	const { postId } = req.params;

	logger.info(`[getPostComments] - Fetching comments for post ${postId}`);

	try {
		const post = await PostModel.findById(postId).lean();

		if (!post) {
			logger.warn(`[getPostComments] - Post not found: ${postId}`);
			return res.status(404).json({ message: "Post not found" });
		}

		const commentDocs = post.comments;

		// Optional: populate basic author info for each comment
		const userIds = commentDocs.map((c) => c.authorId.toString());
		const users = await UserModel.find({ _id: { $in: userIds } })
			.select("_id username profilePic")
			.lean();

		const userMap = new Map(users.map((u) => [u._id.toString(), u]));

		const enrichedComments = commentDocs.map((comment) => ({
			...comment,
			author: userMap.get(comment.authorId.toString()) ?? null,
		}));

		logger.info(
			`[getPostComments] - Found ${enrichedComments.length} comments for post ${postId}`,
		);

		return res.json(enrichedComments);
	} catch (error) {
		logger.error(`[getPostComments] - Failed to get comments for post ${postId}:`, error);
		return res.status(500).json({ message: "Failed to get comments" });
	}
}

export async function deletePost(req: Request, res: Response) {
	const authReq = req as Request & { user: { id: string } };
	const { postId } = req.params;
	const userId = authReq.user.id;

	try {
		const post = await PostModel.findById(postId);

		if (!post) {
			logger.warn(`[deletePost] - Post not found: ${postId}`);
			return res.status(404).json({ message: "Post not found" });
		}

		// Check if the logged-in user is the author
		if (post.authorId.toString() !== userId) {
			logger.warn(`[deletePost] - User ${userId} not authorized to delete post ${postId}`);
			return res.status(403).json({ message: "Not authorized to delete this post" });
		}

		// Delete associated media from S3
		if (post.media && Array.isArray(post.media)) {
			for (const key of post.media) {
				try {
					await deleteMediaByKey(key);
					logger.info(`[deletePost] - Deleted media key ${key} for post ${postId}`);
				} catch (err) {
					logger.error(
						`[deletePost] - Failed to delete media key ${key} for post ${postId}:`,
						err,
					);
				}
			}
		}

		// Delete the post document itself
		await post.deleteOne();

		logger.info(`[deletePost] - Post ${postId} deleted by user ${userId}`);

		return res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		logger.error(`[deletePost] - Failed to delete post ${postId}:`, error);
		return res.status(500).json({ message: "Failed to delete post" });
	}
}
