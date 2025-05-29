import express from "express";
import jwt from "jsonwebtoken";
import logger from "@api/common/logger";
import { findUserByEmail } from "@api/endpoints/me/controller";

const authRouter = express.Router();

authRouter.get("/callback", async (req, res) => {
	const code = req.query.code as string;
	if (!code) return res.status(400).send("Missing code");

	try {
		logger.info("Exchanging authorization code for tokens...");
		const tokenRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "authorization_code",
				client_id: process.env.AUTH0_CLIENT_ID,
				client_secret: process.env.AUTH0_CLIENT_SECRET,
				code,
				redirect_uri: "http://localhost:3000/auth/callback",
			}),
		});

		if (!tokenRes.ok) {
			const errorText = await tokenRes.text();
			logger.error("Auth0 token exchange failed:", errorText);
			return res.status(500).send("Token exchange failed");
		}

		const { id_token } = await tokenRes.json();
		const userInfo = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());

		if (!userInfo.email || !userInfo.email_verified) {
			logger.error("Email missing or not verified");
			return res.status(400).send("Email not verified");
		}

		const appUser = await findUserByEmail(userInfo.email);

		if (!appUser) {
			// User not found → tell frontend username is needed + some basic info
			return res.status(404).json({
				needsUsername: true,
				email: userInfo.email,
				name: userInfo.name,
				profilePic: userInfo.picture,
				sub: userInfo.sub,
			});
		}

		// User exists → issue JWT
		const myToken = jwt.sign(
			{
				id: appUser._id.toString(),
				email: appUser.email,
				sub: userInfo.sub,
			},
			process.env.JWT_SECRET!,
		);

		logger.info(`Issued JWT for user ${userInfo.email}`);
		res.json({ token: myToken });
	} catch (err) {
		logger.error({ err }, "Callback error");
		res.status(500).send("Something went wrong");
	}
});

export default authRouter;
