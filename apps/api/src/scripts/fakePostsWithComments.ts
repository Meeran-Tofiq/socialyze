import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import UserModel from "../endpoints/me/model";
import PostModel, { PostDoc } from "../endpoints/posts/model";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

async function createPosts() {
	await mongoose.connect(process.env.MONGO_URI!);
	console.log("Connected to MongoDB");

	const users = await UserModel.find({ id: { $ne: "683657c33fbe7926aa262e49" } });
	if (users.length === 0) {
		throw new Error("No users found in the database. Run user seed first.");
	}

	console.log(`Found ${users.length} users`);

	const postsCreated = [];

	for (const user of users) {
		const numPosts = faker.number.int({ min: 1, max: 3 });
		for (let i = 0; i < numPosts; i++) {
			const content = faker.lorem.paragraph();

			const newPost = new PostModel({
				authorId: user._id,
				content,
				likes: [],
				comments: [],
			});

			await newPost.save();
			postsCreated.push(newPost);
			console.log(`Created post by ${user.username} (${user._id}): ${newPost._id}`);
		}
	}

	await mongoose.disconnect();
	console.log("Disconnected from MongoDB");

	return postsCreated;
}

async function addComments(posts: PostDoc[]) {
	await mongoose.connect(process.env.MONGO_URI!);
	console.log("Connected to MongoDB");

	const users = await UserModel.find({});
	if (users.length === 0) {
		throw new Error("No users found in the database. Run user seed first.");
	}

	for (const post of posts) {
		const numComments = faker.number.int({ min: 0, max: 5 });

		for (let i = 0; i < numComments; i++) {
			let commenter;
			do {
				commenter = faker.helpers.arrayElement(users);
			} while (commenter._id.toString() === post.authorId.toString());

			const commentContent = faker.lorem.sentence();

			post.comments.push({
				content: commentContent,
				authorId: commenter._id,
				postId: post._id,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		await post.save();
		console.log(`Added ${post.comments.length} comments to post ${post._id}`);
	}

	await mongoose.disconnect();
	console.log("Disconnected from MongoDB");
}

async function main() {
	try {
		const posts = await createPosts();
		await addComments(posts);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

main();
