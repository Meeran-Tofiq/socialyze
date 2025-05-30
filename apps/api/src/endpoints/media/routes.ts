import express from "express";
import { getUploadUrl, getDownloadUrl, deleteMedia } from "./controller";
import { requireAuth } from "@api/common/middleware/jwtToken";

const mediaRouter = express.Router();

mediaRouter.use(requireAuth);

mediaRouter.post("/upload-url", getUploadUrl); // get presigned upload URL
mediaRouter.get("/download-url", getDownloadUrl); // get presigned download URL
mediaRouter.delete("/:key", deleteMedia); // delete media by key

export default mediaRouter;
