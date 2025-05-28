"use client";

import { User } from "@shared/index";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type AuthContextType = {
	token: string | null;
	user: Partial<User> | null;
	login: () => void;
	logout: () => void;
	refetchUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<Partial<User> | null>(null);

	const fetchAndSetUser = useCallback(async () => {
		if (!token) return;
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Failed to fetch user");
			const data = await res.json();
			setUser(data);
		} catch (err) {
			console.error("Failed to fetch user", err);
			setUser(null);
		}
	}, [token]);

	useEffect(() => {
		const stored = getToken();
		if (!stored) return;
		setToken(stored);
	}, []);

	useEffect(() => {
		if (token) fetchAndSetUser();

		const onStorageChange = () => {
			const updated = getToken();
			setToken(updated);
			fetchAndSetUser();
		};
		window.addEventListener("storage", onStorageChange);
		return () => window.removeEventListener("storage", onStorageChange);
	}, [token, fetchAndSetUser]);

	const login = () => {
		window.location.href =
			`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/authorize?` +
			new URLSearchParams({
				response_type: "code",
				client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
				redirect_uri: window.location.origin + "/auth/callback",
				scope: "openid profile email",
			});
	};

	const logout = () => {
		setToken(null);
		setUser(null);
		clearStoredToken();
		window.location.href =
			`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/v2/logout?` +
			new URLSearchParams({
				client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
				returnTo: window.location.origin,
			}).toString();
	};

	return (
		<AuthContext.Provider value={{ token, user, login, logout, refetchUser: fetchAndSetUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};

function getToken(): string | null {
	return localStorage.getItem("jwt");
}

function clearStoredToken() {
	localStorage.removeItem("jwt");
}
