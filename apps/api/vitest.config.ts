// apps/api/vitest.config.ts
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.test" });

export default defineConfig({
	resolve: {
		alias: {
			"@api": path.resolve(__dirname, "src"),
		},
	},
	test: {
		deps: {
			inline: ["@socialyze/shared"], // this forces Vitest to transform your shared package source code
		},
		globals: true,
		environment: "node",
		include: ["tests/**/*.test.ts"], // only run tests in the tests folder
		setupFiles: ["./tests/setup.ts"],
	},
});
