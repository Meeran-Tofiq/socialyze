import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./apiRouter";
import { connectDB } from "./common/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Define allowed origins
const allowedOrigins: string[] = [
	process.env.FRONTEND_ORIGIN,
	"http://localhost:3000",
	"http://13.60.56.248",
	// Add your future domain here when you get it
	// 'https://yourapp.com',
	// 'https://www.yourapp.com'
].filter((origin): origin is string => Boolean(origin));

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	}),
);

app.use(express.json());

app.get("/", (_, res) => {
	res.send("API is running");
});

// Mount routes
app.use("/", apiRouter);

async function startServer() {
	try {
		await connectDB();
		console.log("✅ Connected to MongoDB");
		console.log("🌐 Allowed CORS origins:", allowedOrigins);

		app.listen(PORT, () => {
			console.log(`🚀 Server running on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("❌ Failed to connect to MongoDB", err);
		process.exit(1); // Exit if DB connection fails
	}
}

startServer();
