import { Request, Response } from "express";
import { UserInfo, UserPublic } from "@socialyze/shared";
import UserModel, { UserDoc } from "@api/endpoints/me/model";
import logger from "@api/common/logger";
import getPublicProfileFromUser from "@api/common/publicUser";

// Extend helper to accept flags for follow status and fill them here:
async function getUserPublicWithRelations(
	user: UserDoc,
	currentUser: UserDoc,
): Promise<UserPublic> {
	const publicUser = await getPublicProfileFromUser(user);

	publicUser.isFollowing = currentUser.following.some(
		(id) => id.toString() === user._id.toString(),
	);
	publicUser.hasRequestedFollow = currentUser.sentFollowRequests.some(
		(id) => id.toString() === user._id.toString(),
	);
	publicUser.isFollowedByCurrentUser = user.followers.some(
		(id) => id.toString() === currentUser._id.toString(),
	);

	return publicUser;
}

export async function getUserById(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const targetUserId = req.params.id;

	try {
		const currentUser = await UserModel.findById(authReq.user.id);
		if (!currentUser) {
			logger.warn(`User not found: ${authReq.user.id}`);
			return res.status(404).json({ message: "User not found" });
		}

		const targetUser = await UserModel.findById(targetUserId);
		if (!targetUser) {
			logger.warn(`User not found: ${targetUserId}`);
			return res.status(404).json({ error: "User not found" });
		}

		const publicUser = await getUserPublicWithRelations(targetUser, currentUser);

		logger.info(`Fetched public profile for user ${targetUser._id}`);
		res.json(publicUser);
	} catch (err) {
		logger.error({ err }, "Failed to get user by ID");
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function getAllUsers(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };

	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 20;
	const skip = (page - 1) * limit;

	try {
		const currentUser = await UserModel.findById(authReq.user.id);
		if (!currentUser) {
			logger.warn(`User not found: ${authReq.user.id}`);
			return res.status(404).json({ message: "User not found" });
		}

		const totalUsers = await UserModel.countDocuments({ _id: { $ne: currentUser._id } });
		const users = await UserModel.find({ _id: { $ne: currentUser._id } })
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		const result: UserPublic[] = await Promise.all(
			users.map((user) => getUserPublicWithRelations(user, currentUser)),
		);

		logger.info(
			`Fetched page ${page} (limit ${limit}) of users for user ${currentUser._id}: ${result.length} results`,
		);

		res.json({
			page,
			limit,
			totalPages: Math.ceil(totalUsers / limit),
			totalUsers,
			users: result,
		});
	} catch (err) {
		logger.error({ err }, "Failed to get paginated users");
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function getGroupedUsers(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };

	try {
		const currentUser = await UserModel.findById(authReq.user.id);
		if (!currentUser) {
			logger.warn(`User not found: ${authReq.user.id}`);
			return res.status(404).json({ message: "User not found" });
		}

		const allUsers = await UserModel.find({ _id: { $ne: currentUser._id } });

		// Use Sets for fast lookup
		const followingSet = new Set(currentUser.following.map((id) => id.toString()));
		const followersSet = new Set(currentUser.followers.map((id) => id.toString()));
		const pendingSet = new Set(currentUser.sentFollowRequests.map((id) => id.toString()));

		const grouped = {
			following: [] as UserPublic[],
			followers: [] as UserPublic[],
			pending: [] as UserPublic[],
			others: [] as UserPublic[],
		};

		for (const user of allUsers) {
			const userId = user._id.toString();
			const publicUser = await getUserPublicWithRelations(user, currentUser);

			if (followingSet.has(userId)) {
				grouped.following.push(publicUser);
			} else if (followersSet.has(userId)) {
				grouped.followers.push(publicUser);
			} else if (pendingSet.has(userId)) {
				grouped.pending.push(publicUser);
			} else {
				grouped.others.push(publicUser);
			}
		}

		logger.info(`Fetched grouped users for user ${currentUser._id}`);
		res.json(grouped);
	} catch (err) {
		logger.error({ err }, "Failed to get grouped users");
		res.status(500).json({ error: "Internal server error" });
	}
}
