"use client";

import { useAuth } from "@web/providers/AuthProvider";

export default function LoginButton() {
	const { login } = useAuth();

	return <button onClick={login}>Log In</button>;
}
