import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./apiRouter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
	cors({
		origin: process.env.FRONTEND_ORIGIN,
		credentials: true,
	}),
);
app.use(express.json());

app.get("/", (_, res) => {
	res.send("API is running");
});

// Mount routes
app.use("/", apiRouter);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
