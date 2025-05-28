import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import UserModel from "../endpoints/me/model"; // adjust path if needed

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		throw new Error("MONGO_URI is not defined in .env file");
	}

	await mongoose.connect(uri);
	console.log("Connected to MongoDB");

	const targetName = "Meeran Tofiq";

	// Find the user to keep
	const userToKeep = await UserModel.findOne({ name: targetName });

	if (!userToKeep) {
		throw new Error(`No user found with name "${targetName}"`);
	}

	// Delete all other users
	const result = await UserModel.deleteMany({ _id: { $ne: userToKeep._id } });
	console.log(`Deleted ${result.deletedCount} users`);

	await mongoose.disconnect();
	console.log("Disconnected from MongoDB");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
