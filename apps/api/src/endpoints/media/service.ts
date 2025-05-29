import logger from "@api/common/logger";
import { generateUploadUrl, generateDownloadUrl, deleteObject } from "@api/common/aws/mediaUtils";
import { ALLOWED_IMAGE_MIME_TYPES, AllowedImageMimeType } from "@socialyze/shared";

export async function getPresignedUploadUrl({
	prefix,
	fileName,
	fileType,
	userId,
}: {
	prefix: string;
	fileName: string;
	fileType: AllowedImageMimeType;
	userId: string;
}) {
	if (!prefix || !fileName || !fileType || !userId) {
		throw new Error("Missing required fields");
	}

	if (!ALLOWED_IMAGE_MIME_TYPES.includes(fileType)) {
		throw new Error("Invalid file type. Only image uploads are allowed.");
	}

	logger.info(`Generating upload URL for user: ${userId}, prefix: ${prefix}`);
	return await generateUploadUrl(prefix, userId, fileName, fileType);
}

export async function getPresignedDownloadUrl(key: string) {
	if (!key) {
		throw new Error("Missing or invalid key");
	}
	logger.info(`Generating download URL for key: ${key}`);
	return await generateDownloadUrl(key);
}

export async function deleteMediaByKey(key: string) {
	if (!key) {
		throw new Error("Missing key");
	}
	logger.info(`Deleting media for key: ${key}`);
	return await deleteObject(key);
}
