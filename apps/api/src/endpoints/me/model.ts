import mongoose, { Schema, Document, Model } from "mongoose";
import type { User as SharedUser } from "@socialyze/shared";

export type UserInput = Omit<SharedUser, "_id" | "createdAt" | "updatedAt">;

interface UserDoc extends Document, UserInput {
	_id: string;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<UserDoc>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		bio: { type: String },
		profilePic: { type: String },
		username: { type: String, required: true, unique: true },
		followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		pendingFollowRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		sentFollowRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	},
	{
		timestamps: true,
	},
);

const UserModel: Model<UserDoc> =
	mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);

export default UserModel;
export type { UserDoc };
