import { Comment, Post } from "@socialyze/shared";
import mongoose, { Schema, Document, Model, Types } from "mongoose";

const { ObjectId } = Schema.Types;

export type PostInput = Omit<
	Post,
	"_id" | "createdAt" | "updatedAt" | "likes" | "comments" | "authorId"
>;

export type CommentInput = Omit<Comment, "_id" | "createdAt" | "updatedAt" | "postId" | "authorId">;

// Comment document with ObjectId fields
interface CommentDoc extends Document, CommentInput {
	_id: Types.ObjectId;
	content: string;
	authorId: Types.ObjectId;
	postId: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const CommentSchema = new Schema<CommentDoc>(
	{
		content: { type: String, required: true },
		authorId: { type: ObjectId, ref: "User", required: true },
		postId: { type: ObjectId, ref: "Post", required: true },
	},
	{ timestamps: true },
);

// Post document using ObjectId and embedded comments
interface PostDoc extends Document, PostInput {
	_id: Types.ObjectId;
	authorId: Types.ObjectId;
	content?: string;
	likes: Types.ObjectId[];
	comments: Types.DocumentArray<CommentDoc>;
	createdAt: Date;
	updatedAt: Date;
	media?: string[];
}

const PostSchema = new Schema<PostDoc>(
	{
		authorId: { type: ObjectId, ref: "User", required: true },
		content: { type: String, required: true },
		likes: [{ type: ObjectId, ref: "User" }],
		comments: [CommentSchema],
		mediaUrl: {
			type: [String],
			validate: {
				validator: (arr: string[]) => arr.length <= 5,
				message: "A post can have a maximum of 5 images.",
			},
		},
	},
	{ timestamps: true },
);

const PostModel: Model<PostDoc> =
	mongoose.models.Post || mongoose.model<PostDoc>("Post", PostSchema);

export default PostModel;
export type { PostDoc, CommentDoc };
