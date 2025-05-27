import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define expected shape of your token payload (optional)
interface JwtPayload {
	sub: string;
	email?: string;
	id: string;
	// Add more fields as needed
}

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
	user?: JwtPayload;
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "No token provided" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
		req.user = decoded;
		next();
	} catch {
		return res.status(401).json({ message: "Invalid token" });
	}
};
