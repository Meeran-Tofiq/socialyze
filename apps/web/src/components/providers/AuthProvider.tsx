"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
	token: string | null;
	user: any | null;
	login: () => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<any | null>(null);

	useEffect(() => {
		const stored = getToken();
		if (stored) {
			setToken(stored);
			// Optional: fetch user info with token here
		}

		// Listen for other tabs or navigation updating localStorage
		const onStorageChange = () => {
			const updated = getToken();
			setToken(updated);
		};
		window.addEventListener("storage", onStorageChange);
		return () => window.removeEventListener("storage", onStorageChange);
	}, []);

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
		<AuthContext.Provider value={{ token, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};

function storeToken(token: string) {
	localStorage.setItem("jwt", token);
}

function getToken(): string | null {
	return localStorage.getItem("jwt");
}

function clearStoredToken() {
	localStorage.removeItem("jwt");
}
