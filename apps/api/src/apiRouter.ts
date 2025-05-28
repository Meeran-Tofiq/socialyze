import express from "express";
import authRouter from "./auth/auth";
import userRouter from "./user/routes";
import followsRouter from "./follow/routes";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/follows", followsRouter);

export default apiRouter;
