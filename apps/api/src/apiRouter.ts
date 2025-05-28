import express from "express";
import authRouter from "./auth/auth";
import meRouter from "./me/routes";
import followsRouter from "./follow/routes";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/me", meRouter);
apiRouter.use("/follows", followsRouter);

export default apiRouter;
