"use client";

import type { AuthTokens } from "@socialyze/shared";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function handleAuthCallback(code: string): Promise<AuthTokens> {
	const res = await fetch(`${BACKEND_URL}/callback?code=${code}`, {
		method: "GET",
		credentials: "include",
	});

	if (!res.ok) throw new Error("Failed to exchange code for token");

	return await res.json();
}

export function storeToken(token: string) {
	localStorage.setItem("jwt", token);
}

export function getToken(): string | null {
	return localStorage.getItem("jwt");
}

export function logout() {
	localStorage.removeItem("jwt");
	window.location.href = "/";
}
