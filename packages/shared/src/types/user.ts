export interface User {
	_id: string;
	name: string;
	email: string;
	bio?: string;
	profilePic?: string; // URL to S3
	createdAt: string;
	updatedAt: string;
	username: string;
}
