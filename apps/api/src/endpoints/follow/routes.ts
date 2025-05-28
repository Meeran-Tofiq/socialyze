import express from "express";
import { requireAuth } from "@api/common/middleware/jwtToken";
import {
	acceptRequest,
	declineRequest,
	getPendingRequests,
	sendOrAcceptRequest,
	unfollowOrCancel,
} from "./controller";

const followsRouter = express.Router();

followsRouter.use(requireAuth);

followsRouter.post("/:targetUserId", sendOrAcceptRequest);
followsRouter.delete("/:targetUserId", unfollowOrCancel);
followsRouter.post("/:targetUserId/accept", acceptRequest);
followsRouter.post("/:targetUserId/decline", declineRequest);
followsRouter.get("/requests", getPendingRequests);

export default followsRouter;
