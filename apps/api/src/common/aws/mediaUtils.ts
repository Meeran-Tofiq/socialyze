import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@api/common/aws/s3Client";

/**
 * Generate a presigned upload URL for S3.
 * @param prefix - A folder/prefix for the file (e.g., 'profile', 'posts')
 * @param userId - ID of the user uploading
 * @param fileName - Original filename (to extract extension)
 * @param fileType - MIME type of the file
 */
export async function generateUploadUrl(
	prefix: string,
	userId: string,
	fileName: string,
	fileType: string,
) {
	const ext = fileName.split(".").pop();
	const key = `${prefix}/${userId}-${Date.now()}.${ext}`;

	const command = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET_NAME!,
		Key: key,
		ContentType: fileType,
	});
	const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
	return { uploadUrl, key };
}

/**
 * Generate a presigned download URL for a given S3 key.
 */
export async function generateDownloadUrl(key: string) {
	const command = new GetObjectCommand({
		Bucket: process.env.S3_BUCKET_NAME!,
		Key: key,
	});
	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Delete an object from S3 by key.
 */
export async function deleteObject(key: string) {
	const command = new DeleteObjectCommand({
		Bucket: process.env.S3_BUCKET_NAME!,
		Key: key,
	});
	await s3Client.send(command);
}
