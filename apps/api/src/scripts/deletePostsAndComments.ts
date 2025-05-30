import mongoose from "mongoose";
import PostModel from "../endpoints/posts/model";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

async function deletePostsNotByMe() {
	await mongoose.connect(process.env.MONGO_URI!);
	console.log("Connected to MongoDB");

	const myId = "683657c33fbe7926aa262e49";

	// Delete posts where authorId is NOT my id
	const result = await PostModel.deleteMany({ authorId: { $ne: myId } });

	console.log(`Deleted ${result.deletedCount} posts not authored by me`);

	await mongoose.disconnect();
	console.log("Disconnected from MongoDB");
}

async function main() {
	try {
		await deletePostsNotByMe();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

main();
