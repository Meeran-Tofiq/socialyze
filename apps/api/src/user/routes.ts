import express from "express";
import { deleteUserProfile, getUserProfile, updateUserProfile } from "./controller";
import { requireAuth } from "@api/common/middleware/jwtToken";

const userRouter = express.Router();

userRouter.use(requireAuth);

userRouter.get("/", getUserProfile);
userRouter.patch("/", updateUserProfile); // or `.put()` if you prefer full replacement
userRouter.delete("/", deleteUserProfile);

export default userRouter;
