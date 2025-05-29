import { UserPublic } from "./user";

export interface Comment {
	_id: string;
	postId: string;
	authorId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface CommentWithAuthor extends Comment {
	author: UserPublic;
}
