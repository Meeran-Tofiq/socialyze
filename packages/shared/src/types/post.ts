import { CommentWithAuthor } from "./comment";
import { UserPublic } from "./user";

export interface Post {
	_id: string;
	authorId: string;
	content?: string;
	likes: string[]; // array of userIds
	comments: Comment[];
	createdAt: string;
	updatedAt: string;
	media?: string[];
}

export interface PostWithAuthorAndComment extends Omit<Post, "authorId" | "comments"> {
	author: UserPublic;
	comments: CommentWithAuthor[];
}
