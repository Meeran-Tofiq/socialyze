import mongoose, { Schema, Document, Model, Types } from "mongoose";

const { ObjectId } = Schema.Types;

// Comment document with ObjectId fields
interface CommentDoc extends Document {
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
interface PostDoc extends Document {
	_id: Types.ObjectId;
	authorId: Types.ObjectId;
	content: string;
	likes: Types.ObjectId[];
	comments: Types.DocumentArray<CommentDoc>;
	createdAt: Date;
	updatedAt: Date;
}

const PostSchema = new Schema<PostDoc>(
	{
		authorId: { type: ObjectId, ref: "User", required: true },
		content: { type: String, required: true },
		likes: [{ type: ObjectId, ref: "User" }],
		comments: [CommentSchema],
	},
	{ timestamps: true },
);

const PostModel: Model<PostDoc> =
	mongoose.models.Post || mongoose.model<PostDoc>("Post", PostSchema);

export default PostModel;
export type { PostDoc, CommentDoc };
