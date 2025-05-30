import express from "express";
import authRouter from "./endpoints/auth/auth";
import meRouter from "./endpoints/me/routes";
import usersRouter from "./endpoints/users/routes";
import followsRouter from "./endpoints/follow/routes";
import postsRouter from "./endpoints/posts/routes";
import mediaRouter from "./endpoints/media/routes";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/me", meRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/follows", followsRouter);
apiRouter.use("/posts", postsRouter);
apiRouter.use("/media", mediaRouter);

export default apiRouter;
