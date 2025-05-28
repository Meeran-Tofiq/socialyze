import express from "express";
import authRouter from "./auth/auth";
import meRouter from "./me/routes";
import usersRouter from "./users/routes";
import followsRouter from "./follow/routes";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/me", meRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/follows", followsRouter);

export default apiRouter;
