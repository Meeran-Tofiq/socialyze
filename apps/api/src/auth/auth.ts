import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/callback", async (req, res) => {
	const code = req.query.code as string;

	try {
		const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "authorization_code",
				client_id: process.env.AUTH0_CLIENT_ID,
				client_secret: process.env.AUTH0_CLIENT_SECRET,
				code,
				redirect_uri: `${process.env.BACKEND_BASE_URL}/callback`,
			}),
		});

		if (!response.ok) {
			const errData = await response.text();
			console.error("Auth0 token error:", errData);
			return res.status(500).send("Token exchange failed");
		}

		const { id_token, access_token } = await response.json();

		// Optional: decode id_token to get user info
		const userInfo = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());
		console.log("User Info: " + userInfo);

		// ✅ Issue your own JWT
		const myToken = jwt.sign(
			{ sub: userInfo.sub, email: userInfo.email },
			process.env.JWT_SECRET!,
		);

		// Return it to frontend or set a cookie
		res.json({ token: myToken, access_token });
	} catch (err) {
		console.error("Callback error:", err);
		res.status(500).send("Something went wrong");
	}
});

export default router;
