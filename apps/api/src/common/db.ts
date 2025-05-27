import mongoose from "mongoose";

export async function connectDB() {
	const uri = process.env.MONGO_URI!;
	if (mongoose.connection.readyState >= 1) return;

	await mongoose.connect(uri);
}
