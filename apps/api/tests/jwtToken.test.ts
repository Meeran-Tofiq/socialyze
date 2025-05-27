import { describe, it, expect, vi } from "vitest";
import { Request, Response } from "express";
import { requireAuth } from "../src/common/middleware/jwtToken";
import jwt from "jsonwebtoken";
import { UserInfo } from "@socialyze/shared";

describe("requireAuth", () => {
	it("should call next() if token is valid", async () => {
		const token = jwt.sign({ id: "123", sub: "123" }, process.env.JWT_SECRET!);
		const req = {
			headers: { authorization: `Bearer ${token}` },
		} as Request & { user: UserInfo };

		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		const next = vi.fn();

		requireAuth(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(req.user).toBeDefined();
	});

	it("should return 401 if no token", () => {
		const req = {
			headers: {},
		} as unknown as Request;
		const json = vi.fn();
		const status = vi.fn(() => ({ json }));
		const res = { status } as unknown as Response;
		const next = vi.fn();

		requireAuth(req, res, next);

		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ message: "No token provided" });
		expect(next).not.toHaveBeenCalled();
	});
});
