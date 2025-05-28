import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import UserModel from "../endpoints/me/model";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

async function main() {
	await mongoose.connect(process.env.MONGO_URI!);
	console.log("Connected to MongoDB");

	const NUM_USERS = 20;

	// Get the real user (you)
	const realUsers = await UserModel.find({});
	if (realUsers.length === 0) {
		throw new Error("No existing users found in the database.");
	}
	const me = realUsers[0];
	console.log(`Using existing user: ${me.username} (${me._id})`);

	const createdUsers = [];

	// Create fake users
	for (let i = 0; i < NUM_USERS; i++) {
		const username = faker.internet.username().toLowerCase() + i;
		const email = faker.internet.email().toLowerCase();
		const name = faker.person.fullName();
		const bio = faker.lorem.sentence();
		const profilePic = "uploads/profile-fake-1.jpg";

		const newUser = new UserModel({
			name,
			email,
			bio,
			profilePic,
			username,
			followers: [],
			following: [],
			pendingFollowRequests: [],
			sentFollowRequests: [],
		});

		await newUser.save();
		createdUsers.push(newUser);
		console.log(`Created user ${username} (${newUser._id})`);
	}

	// Some users follow or request to follow you
	for (const user of createdUsers) {
		const action = faker.helpers.arrayElement(["follow", "request", "none"]);

		if (action === "follow") {
			// Add user to your followers
			if (!me.followers.includes(user._id)) {
				me.followers.push(user._id);
			}
			// Add you to their following
			if (!user.following.includes(me._id)) {
				user.following.push(me._id);
			}
		} else if (action === "request") {
			// Add user to your pendingFollowRequests
			if (!me.pendingFollowRequests.includes(user._id)) {
				me.pendingFollowRequests.push(user._id);
			}
			// Add you to their sentFollowRequests
			if (!user.sentFollowRequests.includes(me._id)) {
				user.sentFollowRequests.push(me._id);
			}
		}
	}

	// Randomly assign following between fake users
	for (const user of createdUsers) {
		const followsCount = faker.number.int({ min: 0, max: 5 });
		const possibleFollows = createdUsers.filter(
			(u) => u._id.toString() !== user._id.toString(),
		);
		const shuffled = faker.helpers.shuffle(possibleFollows);
		const toFollow = shuffled.slice(0, followsCount);

		for (const followee of toFollow) {
			if (!user.following.includes(followee._id)) {
				user.following.push(followee._id);
			}
			if (!followee.followers.includes(user._id)) {
				followee.followers.push(user._id);
			}
		}
	}

	// Save all updated users
	await Promise.all([...createdUsers.map((u) => u.save()), me.save()]);

	console.log("Finished assigning followers/follow requests");

	await mongoose.disconnect();
	console.log("Disconnected from MongoDB");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
