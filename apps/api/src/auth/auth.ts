import express from "express";
import jwt from "jsonwebtoken";
import logger from "../common/logger";
import { findOrCreateUser } from "@api/user/controller";
import { UserInfo } from "@shared/index";

const authRouter = express.Router();

authRouter.get("/callback", async (req, res) => {
	const code = req.query.code as string;

	if (!code) {
		return res.status(400).send("Missing code");
	}

	try {
		logger.info("Received authorization code, exchanging for tokens...");

		const tokenRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "authorization_code",
				client_id: process.env.AUTH0_CLIENT_ID,
				client_secret: process.env.AUTH0_CLIENT_SECRET,
				code,
				redirect_uri: "http://localhost:3000/auth/callback", // Must match frontend redirect_uri
			}),
		});

		if (!tokenRes.ok) {
			const errorText = await tokenRes.text();
			logger.error("Auth0 exchange failed:", errorText);
			return res.status(500).send("Token exchange failed");
		}

		const { id_token } = await tokenRes.json();

		logger.info("Successfully received user info from Auth0.");
		const userInfo = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());

		// Trust only verified emails (optional but recommended)
		if (!userInfo.email || !userInfo.email_verified) {
			logger.error("Unverified or missing email");
			return res.status(400).send("Email not verified");
		}

		// Use controller to create or fetch user
		const appUser = await findOrCreateUser({
			email: userInfo.email,
			name: userInfo.name,
			profilePic: userInfo.picture,
		});

		// Issue JWT with your own claims
		const myToken = jwt.sign(
			{
				id: appUser._id.toString(),
				email: appUser.email,
				sub: userInfo.sub,
			} as UserInfo,
			process.env.JWT_SECRET!,
		);

		logger.info(`Issued JWT for user ${userInfo.email} (${userInfo.sub})`);
		res.json({ token: myToken });
	} catch (err) {
		logger.error({ err }, "Callback error");
		res.status(500).send("Something went wrong");
	}
});

export default authRouter;
