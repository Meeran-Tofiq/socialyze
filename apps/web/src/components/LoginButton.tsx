"use client";

import { useAuth } from "./providers/AuthProvider";

export default function LoginButton() {
	const { token, login, logout } = useAuth();

	// Consider user authenticated if token exists
	const isAuthenticated = !!token;

	return isAuthenticated ? (
		<button onClick={logout}>Log Out</button>
	) : (
		<button onClick={login}>Log In</button>
	);
}
