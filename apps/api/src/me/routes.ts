import express from "express";
import {
	createUser,
	deleteUserProfile,
	getProfilePic,
	getUserProfile,
	retrieveProfilePicUploadUrl,
	updateUserProfile,
	uploadProfilePic,
} from "./controller";
import { requireAuth } from "@api/common/middleware/jwtToken";

const meRouter = express.Router();

meRouter.post("/", createUser);
meRouter.use(requireAuth);

meRouter.get("/", getUserProfile);
meRouter.patch("/", updateUserProfile); // or `.put()` if you prefer full replacement
meRouter.delete("/", deleteUserProfile);

// user profile pic
meRouter.get("/profile-pic", getProfilePic);
meRouter.post("/upload-url", retrieveProfilePicUploadUrl);
meRouter.post("/upload-pic", uploadProfilePic);

export default meRouter;
