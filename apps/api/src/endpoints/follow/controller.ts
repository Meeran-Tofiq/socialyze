import UserModel from "@api/endpoints/me/model";
import { UserInfo } from "@socialyze/shared";
import { Request, Response } from "express";

export async function sendOrAcceptRequest(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;
	const targetUserId = req.params.targetUserId;

	if (currentUserId === targetUserId) {
		return res.status(400).json({ error: "You cannot follow yourself." });
	}

	const currentUser = await UserModel.findById(currentUserId);
	const targetUser = await UserModel.findById(targetUserId);

	if (!targetUser || !currentUser) return res.sendStatus(404);

	if (targetUser.followers.some((id) => id.toString() === currentUser._id.toString())) {
		return res.status(400).json({ error: "Already following this user." });
	}

	// Send follow request if not already sent
	if (
		!targetUser.pendingFollowRequests.some((id) => id.toString() === currentUser._id.toString())
	) {
		targetUser.pendingFollowRequests = [...targetUser.pendingFollowRequests, currentUser._id];
		currentUser.sentFollowRequests = [...currentUser.sentFollowRequests, targetUser._id];

		await currentUser.save();
		await targetUser.save();

		return res.status(200).json({ message: "Follow request sent." });
	}

	// Already requested
	return res.status(400).json({ error: "Follow request already sent." });
}

export async function unfollowOrCancel(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;
	const targetUserId = req.params.targetUserId;

	const currentUser = await UserModel.findById(currentUserId);
	const targetUser = await UserModel.findById(targetUserId);

	if (!targetUser || !currentUser) return res.sendStatus(404);

	const isFollowing = targetUser.followers.some(
		(id) => id.toString() === currentUser._id.toString(),
	);
	const isRequestPending = targetUser.pendingFollowRequests.some(
		(id) => id.toString() === currentUser._id.toString(),
	);

	if (isFollowing) {
		targetUser.followers = targetUser.followers.filter(
			(id) => id.toString() !== currentUser._id.toString(),
		);
		currentUser.following = currentUser.following.filter(
			(id) => id.toString() !== targetUser._id.toString(),
		);
	}

	if (isRequestPending) {
		targetUser.pendingFollowRequests = targetUser.pendingFollowRequests.filter(
			(id) => id.toString() !== currentUser._id.toString(),
		);
		currentUser.sentFollowRequests = currentUser.sentFollowRequests.filter(
			(id) => id.toString() !== targetUser._id.toString(),
		);
	}

	await currentUser.save();
	await targetUser.save();

	res.status(200).json({ message: "Unfollowed or request cancelled." });
}

export async function acceptRequest(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;
	const targetUserId = req.params.targetUserId;

	const currentUser = await UserModel.findById(currentUserId);
	const requester = await UserModel.findById(targetUserId);

	if (!currentUser || !requester) return res.sendStatus(404);

	const requestExists = currentUser.pendingFollowRequests.some(
		(id) => id.toString() === requester._id.toString(),
	);

	if (!requestExists) {
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

	res.status(200).json({ message: "Follow request accepted." });
}

export async function declineRequest(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;
	const targetUserId = req.params.targetUserId;

	const currentUser = await UserModel.findById(currentUserId);
	const requester = await UserModel.findById(targetUserId);

	if (!currentUser || !requester) return res.sendStatus(404);

	currentUser.pendingFollowRequests = currentUser.pendingFollowRequests.filter(
		(id) => id.toString() !== requester._id.toString(),
	);
	requester.sentFollowRequests = requester.sentFollowRequests.filter(
		(id) => id.toString() !== currentUser._id.toString(),
	);

	await currentUser.save();
	await requester.save();

	res.status(200).json({ message: "Follow request declined." });
}

export async function getPendingRequests(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };
	const currentUserId = authReq.user?.id;

	const currentUser = await UserModel.findById(currentUserId).populate(
		"pendingFollowRequests",
		"username profilePic",
	);

	if (!currentUser) return res.sendStatus(404);

	res.status(200).json({ pendingRequests: currentUser.pendingFollowRequests });
}
