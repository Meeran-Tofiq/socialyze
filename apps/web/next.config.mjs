/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: [
			"socialyze-profile-pics-b67ae6e0.s3.eu-west-2.amazonaws.com", // Your S3 bucket
			"lh3.googleusercontent.com", // Google profile photos
			"avatars.githubusercontent.com", // GitHub profile photos
		],
	},
};

export default nextConfig;
