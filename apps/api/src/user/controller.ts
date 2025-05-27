import { Request, Response } from "express";
import { UserInfo } from "@socialyze/shared";
import UserModel, { UserInput } from "./model";
import logger from "../common/logger";
import getManagementToken from "@api/common/auth0";

export async function findOrCreateUser({ email, name, profilePic }: UserInput) {
	try {
		let user = await UserModel.findOne({ email });

		if (!user) {
			logger.info(`User not found. Creating new user: ${email}`);
			user = await UserModel.create({ email, name, profilePic });
			logger.info(`Created new user: ${user._id}`);
		} else {
			logger.info(`Found existing user: ${user._id}`);
		}

		return user;
	} catch (err) {
		logger.error({ err }, `Error in findOrCreateUser for email: ${email}`);
		throw err;
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

		const user = await UserModel.findOneAndUpdate({ email: authReq.user.email }, updates, {
			new: true,
		});

		if (!user) {
			logger.warn(`User not found during update: ${authReq.user.email}`);
			return res.status(404).json({ message: "User not found" });
		}

		logger.info(`Profile updated for user: ${user._id}`);
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
