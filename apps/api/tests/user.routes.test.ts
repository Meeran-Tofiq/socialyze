import request from "supertest";
import express from "express";
import userRouter from "../src/endpoints/me/routes";
import { vi, describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import UserModel from "../src/endpoints/me/model";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Original requireAuth mock function placeholder, will be replaced in each test as needed
let requireAuthMock: any;

// Mock requireAuth middleware to inject a dummy user, default no-op (will override in tests)
vi.mock("../src/common/middleware/jwtToken", () => ({
	requireAuth: (req: any, _: any, next: any) => {
		if (requireAuthMock) {
			return requireAuthMock(req, _, next);
		}
		next();
	},
}));

// Mock AWS SDK functions used in controller
vi.mock("@aws-sdk/client-s3", async () => {
	class MockS3Client {
		send = vi.fn();
	}
	return {
		S3Client: MockS3Client,
		DeleteObjectCommand: vi.fn(),
		GetObjectCommand: vi.fn(),
		PutObjectCommand: vi.fn(),
	};
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
	getSignedUrl: vi.fn().mockResolvedValue("https://signed-url"),
}));

// Mock getManagementToken and fetch in deleteUserProfile
vi.mock("../src/common/auth0", () => ({
	default: vi.fn().mockResolvedValue("fake-token"),
}));

global.fetch = vi.fn().mockResolvedValue({
	ok: true,
	text: () => Promise.resolve(""),
});

const app = express();
app.use(express.json());
app.use("/me", userRouter);

describe("User routes", () => {
	beforeEach(async () => {
		// Clear DB
		await UserModel.deleteMany({});
		// Reset requireAuthMock before each test
		requireAuthMock = undefined;
	});

	it("GET /me - should return 404 if user not found", async () => {
		// Mock requireAuth to inject user that does NOT exist in DB
		requireAuthMock = (req: any, _: any, next: any) => {
			req.user = {
				email: "nonexistent@example.com",
				id: new mongoose.Types.ObjectId().toHexString(),
				sub: "auth0|none",
			};
			next();
		};

		const res = await request(app).get("/me");
		expect(res.status).toBe(404);
		expect(res.body.message).toBe("User not found");
	});

	it("GET /me - should return user profile if found", async () => {
		// Create user with unique email
		const user = await UserModel.create({
			email: "user1@example.com",
			name: "Test User",
			username: "meran",
		});

		// Mock requireAuth to inject this user
		requireAuthMock = (req: any, _: any, next: any) => {
			req.user = {
				email: user.email,
				id: user._id.toHexString(),
				sub: "auth0|123",
			};
			next();
		};

		const res = await request(app).get("/me");
		expect(res.status).toBe(200);
		expect(res.body.email).toBe(user.email);
	});

	it("PATCH /me - should update user profile", async () => {
		// Create user
		const user = await UserModel.create({
			email: "user2@example.com",
			name: "Old Name",
			username: "meran",
		});

		// Mock requireAuth to inject this user
		requireAuthMock = (req: any, _: any, next: any) => {
			req.user = {
				email: user.email,
				id: user._id.toHexString(),
				sub: "auth0|123",
			};
			next();
		};

		const res = await request(app).patch("/me").send({ name: "New Name" });
		expect(res.status).toBe(200);
		expect(res.body.name).toBe("New Name");
	});

	it("DELETE /me - should delete user and return success message", async () => {
		// Create user
		const user = await UserModel.create({
			email: "user3@example.com",
			name: "Delete Me",
			username: "meran",
		});

		// Mock requireAuth to inject this user
		requireAuthMock = (req: any, _: any, next: any) => {
			req.user = {
				email: user.email,
				id: user._id.toHexString(),
				sub: "auth0|123",
			};
			next();
		};

		const res = await request(app).delete("/me");
		expect(res.status).toBe(200);
		expect(res.body.message).toBe("User deleted from MongoDB and Auth0");
	});
});
