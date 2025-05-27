import express from "express";
import authRouter from "./auth/auth";
import userRouter from "./user/routes";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);

export default apiRouter;
