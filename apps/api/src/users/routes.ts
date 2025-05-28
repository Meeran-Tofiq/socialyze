import express from "express";
import { getUserById, getAllUsers, getGroupedUsers } from "./controller";
import { requireAuth } from "@api/common/middleware/jwtToken";

const usersRouter = express.Router();

usersRouter.use(requireAuth);

usersRouter.get("/grouped", getGroupedUsers);
usersRouter.get("/", getAllUsers);
usersRouter.get("/:id", getUserById);

export default usersRouter;
