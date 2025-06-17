module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
		es2021: true,
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	ignorePatterns: [
		"postcss.config.js",
		"tailwind.config.js",
		"*.config.js",
		"**/*.d.ts", // optional: ignore TypeScript declaration files
		"**/dist/*",
	],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"prettier",
	],
	plugins: ["@typescript-eslint", "react", "react-hooks"],
	settings: {
		react: {
			version: "detect",
		},
	},
};
