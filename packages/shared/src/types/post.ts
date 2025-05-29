export interface Post {
	_id: string;
	authorId: string;
	content: string;
	likes: string[]; // array of userIds
	comments: Comment[];
	createdAt: string;
	updatedAt: string;
}
