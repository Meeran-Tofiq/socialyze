module.exports = {
	apps: [
		{
			name: "api",
			script: "dist/index.js",
			cwd: "apps/api",
			env: {
				NODE_ENV: "production",
			},
		},
		{
			name: "web",
			script: "node_modules/next/dist/bin/next",
			args: "start",
			cwd: "apps/web",
			env: {
				NODE_ENV: "production",
				PORT: 3000,
			},
		},
	],
};
