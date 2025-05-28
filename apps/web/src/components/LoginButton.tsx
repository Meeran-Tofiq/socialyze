"use client";

import { useAuth } from "@web/providers/AuthProvider";

export default function LoginButton() {
	const { user, login, logout } = useAuth();

	const isAuthenticated = !!user;
	return isAuthenticated ? (
		<button onClick={logout}>Log Out</button>
	) : (
		<button onClick={login}>Log In</button>
	);
}
