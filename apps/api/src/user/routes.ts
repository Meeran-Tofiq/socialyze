import express from "express";
import {
	deleteUserProfile,
	getProfilePic,
	getUserProfile,
	retrieveProfilePicUploadUrl,
	updateUserProfile,
	uploadProfilePic,
} from "./controller";
import { requireAuth } from "@api/common/middleware/jwtToken";

const userRouter = express.Router();

userRouter.use(requireAuth);

userRouter.get("/", getUserProfile);
userRouter.patch("/", updateUserProfile); // or `.put()` if you prefer full replacement
userRouter.delete("/", deleteUserProfile);

// user profile pic
userRouter.get("/profile-pic", getProfilePic);
userRouter.post("/upload-url", retrieveProfilePicUploadUrl);
userRouter.post("/upload-pic", uploadProfilePic);

export default userRouter;
