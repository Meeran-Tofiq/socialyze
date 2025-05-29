import { Request, Response } from "express";
import logger from "@api/common/logger";
import { getPresignedUploadUrl, getPresignedDownloadUrl, deleteMediaByKey } from "./service";
import { ALLOWED_IMAGE_MIME_TYPES } from "@socialyze/shared";

export async function getUploadUrl(req: Request, res: Response) {
	const authReq = req as Request & { user: { id: string; email: string } };
	const { prefix, fileName, fileType } = req.body;

	if (!ALLOWED_IMAGE_MIME_TYPES.includes(fileType)) {
		logger.error("Invalid file type. Only image uploads are allowed.");
	}

	try {
		const { uploadUrl, key } = await getPresignedUploadUrl({
			prefix,
			fileName,
			fileType,
			userId: authReq.user.id,
		});
		logger.info(`Generated upload URL for user: ${authReq.user.id}, key: ${key}`);
		return res.json({ uploadUrl, key });
	} catch (err) {
		logger.error({ err }, "Failed to generate upload URL");
		return res.status(400).json({ error: err instanceof Error ? err.message : "Error" });
	}
}

export async function getDownloadUrl(req: Request, res: Response) {
	const { key } = req.query;

	try {
		if (typeof key !== "string") throw new Error("Missing or invalid key");

		const url = await getPresignedDownloadUrl(key);
		logger.info(`Generated download URL for key: ${key}`);
		return res.json({ url });
	} catch (err) {
		logger.error({ err }, "Failed to generate download URL");
		return res.status(400).json({ error: err instanceof Error ? err.message : "Error" });
	}
}

export async function deleteMedia(req: Request, res: Response) {
	const { key } = req.params;
	const authReq = req as Request & { user: { id: string; email: string } };

	try {
		await deleteMediaByKey(key);
		logger.info(`Deleted media for key: ${key} by user: ${authReq.user.id}`);
		return res.json({ message: "Media deleted successfully" });
	} catch (err) {
		logger.error({ err }, "Failed to delete media");
		return res.status(400).json({ error: err instanceof Error ? err.message : "Error" });
	}
}
