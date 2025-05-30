import express from "express";
import { createUser, deleteUserProfile, getUserProfile, updateUserProfile } from "./controller";
import { requireAuth } from "@api/common/middleware/jwtToken";

const meRouter = express.Router();

meRouter.post("/", createUser);
meRouter.use(requireAuth);

meRouter.get("/", getUserProfile);
meRouter.patch("/", updateUserProfile); // or `.put()` if you prefer full replacement
meRouter.delete("/", deleteUserProfile);

export default meRouter;
