import { Request, Response } from "express";
import { UserInfo, UserPublic } from "@socialyze/shared";
import UserModel from "@api/me/model";
import logger from "@api/common/logger";
import { generateDownloadUrl } from "@api/common/aws/profileImageService";

async function getProfilePicUrl(profilePic: string) {
	if (profilePic.startsWith("http")) return profilePic;

	return await generateDownloadUrl(profilePic);
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

		const profilePicUrl = targetUser.profilePic
			? await getProfilePicUrl(targetUser.profilePic)
			: undefined;

		const publicUser: UserPublic = {
			_id: targetUser._id.toString(),
			username: targetUser.username,
			profilePic: profilePicUrl,
			bio: targetUser.bio,
			createdAt: targetUser.createdAt.toISOString(),
			isFollowing: currentUser?.following.includes(targetUser._id) ?? false,
			hasRequestedFollow: currentUser?.sentFollowRequests.includes(targetUser._id) ?? false,
			isFollowedByCurrentUser: targetUser.followers.includes(currentUser._id) ?? false,
		};

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
			users.map(async (user) => {
				const profilePicUrl = user.profilePic
					? await getProfilePicUrl(user.profilePic)
					: undefined;

				return {
					_id: user._id.toString(),
					username: user.username,
					profilePic: profilePicUrl,
					bio: user.bio,
					createdAt: user.createdAt.toISOString(),
					isFollowing: currentUser.following.includes(user._id),
					hasRequestedFollow: currentUser.sentFollowRequests.includes(user._id),
					isFollowedByCurrentUser: user.followers.includes(currentUser._id),
				};
			}),
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
			const profilePicUrl = user.profilePic
				? await getProfilePicUrl(user.profilePic)
				: undefined;

			const userPublic: UserPublic = {
				_id: userId,
				username: user.username,
				profilePic: profilePicUrl,
				bio: user.bio,
				createdAt: user.createdAt.toISOString(),
				isFollowing: followingSet.has(userId),
				hasRequestedFollow: pendingSet.has(userId),
				isFollowedByCurrentUser: followersSet.has(userId),
			};

			if (followingSet.has(userId)) {
				grouped.following.push(userPublic);
			} else if (followersSet.has(userId)) {
				grouped.followers.push(userPublic);
			} else if (pendingSet.has(userId)) {
				grouped.pending.push(userPublic);
			} else {
				grouped.others.push(userPublic);
			}
		}

		logger.info(`Fetched grouped users for user ${currentUser._id}`);
		res.json(grouped);
	} catch (err) {
		logger.error({ err }, "Failed to get grouped users");
		res.status(500).json({ error: "Internal server error" });
	}
}
