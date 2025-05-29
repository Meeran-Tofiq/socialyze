import { Request, Response } from "express";
import { UserInfo } from "@socialyze/shared";
import UserModel from "./model";
import logger from "@api/common/logger";
import getManagementToken from "@api/common/auth0";
import jwt from "jsonwebtoken";
import { deleteMediaByKey, getPresignedDownloadUrl } from "../media/service";

export async function findUserByEmail(email: string) {
	return await UserModel.findOne({ email });
}

export async function createUser(req: Request, res: Response) {
	const { email, name, profilePic, username, sub } = req.body;

	if (!email || !username || !sub) {
		return res.status(400).send("Missing required fields");
	}

	try {
		const newUser = await UserModel.create({
			email,
			name,
			profilePic,
			username,
		});

		const myToken = jwt.sign(
			{
				id: newUser._id.toString(),
				email: newUser.email,
				sub,
			},
			process.env.JWT_SECRET!,
		);

		logger.info(`Created new user and issued JWT: ${newUser.email}`);
		res.json({ token: myToken });
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error({ err }, "Error creating user");
			if (err.message === "Username already taken") {
				return res.status(409).send("Username already taken");
			}
		} else {
			logger.error("Unknown error", err);
		}
		res.status(500).send("Failed to create user");
	}
}

export async function getUserProfile(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };

	try {
		logger.info(`Fetching profile for user: ${authReq.user.email}`);

		const user = await UserModel.findOne({ email: authReq.user.email });

		if (!user) {
			logger.warn(`User not found: ${authReq.user.email}`);
			return res.status(404).json({ message: "User not found" });
		}

		if (user.profilePic && !user.profilePic.startsWith("http")) {
			user.profilePic = await getPresignedDownloadUrl(user.profilePic);
		}

		logger.info(`Profile fetched for user: ${user._id}`);
		res.json(user);
	} catch (err) {
		logger.error({ err }, "Failed to fetch user profile");
		res.status(500).json({ error: "Failed to fetch profile" });
	}
}

export async function updateUserProfile(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };

	try {
		const updates = req.body;
		logger.info({ updates }, `Updating profile for user: ${authReq.user.email}`);

		const existingUser = await UserModel.findOne({ email: authReq.user.email });
		if (!existingUser) {
			logger.warn(`User not found during update: ${authReq.user.email}`);
			return res.status(404).json({ message: "User not found" });
		}

		// If profilePic is being updated and the existing user has a different one, delete the old one
		if (
			updates.profilePic &&
			existingUser.profilePic &&
			updates.profilePic !== existingUser.profilePic
		) {
			try {
				await deleteMediaByKey(existingUser.profilePic);
				logger.info(`Deleted old profile pic from S3: ${existingUser.profilePic}`);
			} catch (deleteErr) {
				logger.warn({ deleteErr }, "Failed to delete old profile picture from S3");
			}
		}

		const user = await UserModel.findOneAndUpdate({ email: authReq.user.email }, updates, {
			new: true,
		});

		logger.info(`Profile updated for user: ${user?._id}`);
		res.json(user);
	} catch (err) {
		logger.error({ err }, "Failed to update user profile");
		res.status(500).json({ error: "Failed to update profile" });
	}
}

export async function deleteUserProfile(req: Request, res: Response) {
	const authReq = req as Request & { user: UserInfo };

	try {
		logger.info(`Deleting user from MongoDB: ${authReq.user.email}`);

		const dbUser = await UserModel.findOneAndDelete({ email: authReq.user.email });

		if (!dbUser) {
			logger.warn(`User not found in DB: ${authReq.user.email}`);
			return res.status(404).json({ message: "User not found" });
		}

		logger.info(`Deleted user from DB: ${authReq.user.email}`);

		const token = await getManagementToken();

		const deleteRes = await fetch(
			`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(authReq.user.sub)}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!deleteRes.ok) {
			const errText = await deleteRes.text();
			logger.error(`Failed to delete user from Auth0: ${errText}`);
			return res.status(500).json({ error: "Failed to delete user from Auth0" });
		}

		logger.info(`Deleted user from Auth0: ${authReq.user.sub}`);
		res.json({ message: "User deleted from MongoDB and Auth0" });
	} catch (err) {
		logger.error({ err }, "Failed to delete user");
		res.status(500).json({ error: "Internal server error" });
	}
}

// export async function retrieveProfilePicUploadUrl(req: Request, res: Response) {
// 	const authReq = req as Request & { user: UserInfo };
// 	const { fileName, fileType } = authReq.body;
// 	const userId = authReq.user?.id;
//
// 	logger.info(`Request to retrieve profile pic upload URL by user: ${userId}`);
//
// 	if (!fileName || !fileType || !userId) {
// 		logger.warn(
// 			`Missing fields in upload URL request: fileName=${fileName}, fileType=${fileType}, userId=${userId}`,
// 		);
// 		return res.status(400).json({ error: "Missing fields" });
// 	}
//
// 	try {
// 		const { uploadUrl, key } = await profileImageService.generateUploadUrl(
// 			authReq.user.id,
// 			fileName,
// 			fileType,
// 		);
//
// 		logger.info(`Generated S3 upload URL for user: ${userId}, key: ${key}`);
// 		res.json({ uploadUrl, key });
// 	} catch (err) {
// 		logger.error({ err }, `Failed to generate upload URL for user: ${userId}`);
// 		res.status(500).json({ error: "Failed to generate upload URL" });
// 	}
// }
//
// export async function uploadProfilePic(req: Request, res: Response) {
// 	const { key } = req.body;
// 	const authReq = req as Request & { user: UserInfo };
// 	const userId = authReq.user.id;
//
// 	logger.info(`Request to associate profile image key with user: ${userId}, key: ${key}`);
//
// 	if (!key || !userId) {
// 		logger.warn(`Missing key or userId in uploadProfilePic: key=${key}, userId=${userId}`);
// 		return res.status(400).json({ error: "Missing key" });
// 	}
//
// 	try {
// 		// Fetch the full user document from MongoDB
// 		const user = await UserModel.findOne({ _id: userId });
//
// 		if (!user) {
// 			logger.warn(`User not found in DB for ID: ${userId}`);
// 			return res.status(404).json({ error: "User not found" });
// 		}
//
// 		const oldProfilePic = user.profilePic;
// 		logger.info("old prof pic:", oldProfilePic);
//
// 		// Only delete if it's an internal S3-stored key (not an external URL)
// 		if (oldProfilePic && !oldProfilePic.startsWith("http")) {
// 			logger.info(`Deleting previous S3 image: ${oldProfilePic}`);
//
// 			try {
// 				await profileImageService.deleteOldProfilePic(oldProfilePic);
// 				logger.info(`Successfully deleted old profile pic from S3: ${oldProfilePic}`);
// 			} catch (s3Err) {
// 				logger.error({ s3Err }, `Error deleting old profile image: ${oldProfilePic}`);
// 			}
// 		} else if (oldProfilePic) {
// 			logger.info(`Old profile image is external (${oldProfilePic}) — skipping deletion`);
// 		}
//
// 		// Update user record with the new profilePic key
// 		await UserModel.findOneAndUpdate({ _id: userId }, { profilePic: key });
// 		logger.info(`Updated profilePic in DB for user: ${userId}`);
//
// 		res.status(200).json({ message: "Profile image updated" });
// 	} catch (err) {
// 		logger.error({ err }, `Error handling profile image upload for user: ${userId}`);
// 		res.status(500).json({ error: "Failed to update profile image" });
// 	}
// }
//
// export async function getProfilePic(req: Request, res: Response) {
// 	const { key } = req.query;
//
// 	logger.info(`Request to get profile image URL for key: ${key}`);
//
// 	if (typeof key !== "string") {
// 		logger.warn(`Invalid or missing key in getProfilePic: ${key}`);
// 		return res.status(400).json({ error: "Missing or invalid key" });
// 	}
//
// 	try {
// 		const url = await profileImageService.generateDownloadUrl(key);
// 		logger.info(`Signed URL generated for key: ${key}`);
// 		res.json({ url });
// 	} catch (err) {
// 		logger.error({ err }, `Failed to generate signed URL for key: ${key}`);
// 		res.status(500).json({ error: "Failed to generate signed URL" });
// 	}
// }
