export interface User {
	_id: string;
	name: string;
	email: string;
	bio?: string;
	profilePic?: string; // URL to S3
	createdAt: string;
	updatedAt: string;
	username: string;
	followers: string[];
	following: string[];
	pendingFollowRequests: string[];
	sentFollowRequests: string[];
}

export interface UserPublic
	extends Pick<User, "_id" | "username" | "profilePic" | "bio" | "createdAt"> {
	isFollowing: boolean;
	hasRequestedFollow: boolean;
	isFollowedByCurrentUser: boolean;
}
