import { UserPublic } from "./user";

export interface Post {
	_id: string;
	authorId: string;
	content: string;
	likes: string[]; // array of userIds
	comments: Comment[];
	createdAt: string;
	updatedAt: string;
}

export interface PostWithAuthor extends Omit<Post, "authorId"> {
	author: UserPublic;
}
