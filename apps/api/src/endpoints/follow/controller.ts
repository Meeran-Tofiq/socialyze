import logger from "@api/common/logger";
import getPublicProfileFromUser from "@api/common/publicUser";
import UserModel, { UserDoc } from "@api/endpoints/me/model";
import { UserInfo, UserPublic } from "@socialyze/shared";
import { Request, Response } from "express";

function enrichWithFollowFlags(
	userPublic: UserPublic,
	userDoc: UserDoc,
	viewerId: string,
	viewerDoc: UserDoc,
) {
	userPublic.isFollowing = userDoc.followers.some((id: string) => id.toString() === viewerId);
	userPublic.hasRequestedFollow = userDoc.pendingFollowRequests.some(
		(id: string) => id.toString() === viewerId,
	);
	userPublic.isFollowedByCurrentUser = viewerDoc.followers.some(
		(id: string) => id.toString() === userDoc._id.toString(),
	);
	return userPublic;
}

export async function sendOrAcceptRequest(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;
	const targetUserId = req.params.targetUserId;

	logger.info("[sendOrAcceptRequest] currentUserId: %s", currentUserId);
	logger.info("[sendOrAcceptRequest] targetUserId: %s", targetUserId);

	if (currentUserId === targetUserId) {
		logger.warn("[sendOrAcceptRequest] Attempted to follow self");
		return res.status(400).json({ error: "You cannot follow yourself." });
	}

	const currentUser = await UserModel.findById(currentUserId);
	const targetUser = await UserModel.findById(targetUserId);

	if (!currentUser) {
		logger.error("[sendOrAcceptRequest] Current user not found: %s", currentUserId);
		return res.sendStatus(404);
	}
	if (!targetUser) {
		logger.error("[sendOrAcceptRequest] Target user not found: %s", targetUserId);
		return res.sendStatus(404);
	}

	if (targetUser.followers.some((id) => id.toString() === currentUser._id.toString())) {
		logger.warn("[sendOrAcceptRequest] Already following user: %s", targetUserId);
		return res.status(400).json({ error: "Already following this user." });
	}

	if (
		!targetUser.pendingFollowRequests.some((id) => id.toString() === currentUser._id.toString())
	) {
		logger.info("[sendOrAcceptRequest] Adding follow request");
		targetUser.pendingFollowRequests = [...targetUser.pendingFollowRequests, currentUser._id];
		currentUser.sentFollowRequests = [...currentUser.sentFollowRequests, targetUser._id];

		await currentUser.save();
		await targetUser.save();

		logger.info("[sendOrAcceptRequest] Saved follow request to DB");

		const publicProfile = await getPublicProfileFromUser(targetUser);
		enrichWithFollowFlags(publicProfile, targetUser, currentUserId!, currentUser);

		logger.info("[sendOrAcceptRequest] Returning updated public profile");
		return res.status(200).json(publicProfile);
	}

	logger.warn("[sendOrAcceptRequest] Follow request already sent");
	return res.status(400).json({ error: "Follow request already sent." });
}

export async function unfollowOrCancel(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;
	const targetUserId = req.params.targetUserId;

	logger.info("[unfollowOrCancel] currentUserId: %s", currentUserId);
	logger.info("[unfollowOrCancel] targetUserId: %s", targetUserId);

	const currentUser = await UserModel.findById(currentUserId);
	const targetUser = await UserModel.findById(targetUserId);

	if (!currentUser) {
		logger.error("[unfollowOrCancel] Current user not found: %s", currentUserId);
		return res.sendStatus(404);
	}
	if (!targetUser) {
		logger.error("[unfollowOrCancel] Target user not found: %s", targetUserId);
		return res.sendStatus(404);
	}

	const isFollowing = targetUser.followers.some(
		(id) => id.toString() === currentUser._id.toString(),
	);
	const isRequestPending = targetUser.pendingFollowRequests.some(
		(id) => id.toString() === currentUser._id.toString(),
	);

	logger.info(
		"[unfollowOrCancel] isFollowing: %s, isRequestPending: %s",
		isFollowing,
		isRequestPending,
	);

	if (isFollowing) {
		logger.info("[unfollowOrCancel] Removing follower and following");
		targetUser.followers = targetUser.followers.filter(
			(id) => id.toString() !== currentUser._id.toString(),
		);
		currentUser.following = currentUser.following.filter(
			(id) => id.toString() !== targetUser._id.toString(),
		);
	}

	if (isRequestPending) {
		logger.info("[unfollowOrCancel] Removing pending follow request");
		targetUser.pendingFollowRequests = targetUser.pendingFollowRequests.filter(
			(id) => id.toString() !== currentUser._id.toString(),
		);
		currentUser.sentFollowRequests = currentUser.sentFollowRequests.filter(
			(id) => id.toString() !== targetUser._id.toString(),
		);
	}

	await currentUser.save();
	await targetUser.save();

	logger.info("[unfollowOrCancel] Saved changes");

	const publicProfile = await getPublicProfileFromUser(targetUser);
	enrichWithFollowFlags(publicProfile, targetUser, currentUserId!, currentUser);

	return res.status(200).json(publicProfile);
}

export async function acceptRequest(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;
	const targetUserId = req.params.targetUserId;

	logger.info("[acceptRequest] currentUserId: %s", currentUserId);
	logger.info("[acceptRequest] targetUserId: %s", targetUserId);

	const currentUser = await UserModel.findById(currentUserId);
	const requester = await UserModel.findById(targetUserId);

	if (!currentUser) {
		logger.error("[acceptRequest] Current user not found: %s", currentUserId);
		return res.sendStatus(404);
	}
	if (!requester) {
		logger.error("[acceptRequest] Requester not found: %s", targetUserId);
		return res.sendStatus(404);
	}

	const requestExists = currentUser.pendingFollowRequests.some(
		(id) => id.toString() === requester._id.toString(),
	);

	if (!requestExists) {
		logger.warn("[acceptRequest] No request to accept");
		return res.status(400).json({ error: "No request to accept." });
	}

	currentUser.pendingFollowRequests = currentUser.pendingFollowRequests.filter(
		(id) => id.toString() !== requester._id.toString(),
	);
	requester.sentFollowRequests = requester.sentFollowRequests.filter(
		(id) => id.toString() !== currentUser._id.toString(),
	);

	currentUser.followers = [...currentUser.followers, requester._id];
	requester.following = [...requester.following, currentUser._id];

	await currentUser.save();
	await requester.save();

	logger.info("[acceptRequest] Accepted follow request and saved changes");

	const publicProfile = await getPublicProfileFromUser(requester);
	enrichWithFollowFlags(publicProfile, requester, currentUserId!, currentUser);

	return res.status(200).json(publicProfile);
}

export async function declineRequest(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;
	const targetUserId = req.params.targetUserId;

	logger.info("[declineRequest] currentUserId: %s", currentUserId);
	logger.info("[declineRequest] targetUserId: %s", targetUserId);

	const currentUser = await UserModel.findById(currentUserId);
	const requester = await UserModel.findById(targetUserId);

	if (!currentUser) {
		logger.error("[declineRequest] Current user not found: %s", currentUserId);
		return res.sendStatus(404);
	}
	if (!requester) {
		logger.error("[declineRequest] Requester not found: %s", targetUserId);
		return res.sendStatus(404);
	}

	currentUser.pendingFollowRequests = currentUser.pendingFollowRequests.filter(
		(id) => id.toString() !== requester._id.toString(),
	);
	requester.sentFollowRequests = requester.sentFollowRequests.filter(
		(id) => id.toString() !== currentUser._id.toString(),
	);

	await currentUser.save();
	await requester.save();

	logger.info("[declineRequest] Declined follow request and saved changes");

	const publicProfile = await getPublicProfileFromUser(requester);
	enrichWithFollowFlags(publicProfile, requester, currentUserId!, currentUser);

	return res.status(200).json(publicProfile);
}

export async function getPendingRequests(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;

	logger.info("[getPendingRequests] currentUserId: %s", currentUserId);

	const currentUser = await UserModel.findById(currentUserId).populate(
		"pendingFollowRequests",
		"username profilePic",
	);

	if (!currentUser) {
		logger.error("[getPendingRequests] Current user not found: %s", currentUserId);
		return res.sendStatus(404);
	}

	logger.info("[getPendingRequests] Returning pending follow requests");
	res.status(200).json({ pendingRequests: currentUser.pendingFollowRequests });
}
