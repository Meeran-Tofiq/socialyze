import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@api/common/aws/s3Client";

export async function generateUploadUrl(userId: string, fileName: string, fileType: string) {
	const key = `uploads/profile-${userId}-${Date.now()}.${fileName.split(".").pop()}`;
	const command = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET_NAME!,
		Key: key,
		ContentType: fileType,
	});
	const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
	return { uploadUrl, key };
}

export async function generateDownloadUrl(key: string) {
	const command = new GetObjectCommand({
		Bucket: process.env.S3_BUCKET_NAME!,
		Key: key,
	});
	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteOldProfilePic(key: string) {
	const command = new DeleteObjectCommand({
		Bucket: process.env.S3_BUCKET_NAME!,
		Key: key,
	});
	await s3Client.send(command);
}
