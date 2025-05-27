// apps/api/vitest.config.ts
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["tests/**/*.test.ts"], // only run tests in the tests folder
		setupFiles: ["./tests/setup.ts"],
	},
});
