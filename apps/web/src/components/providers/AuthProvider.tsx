"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

type AuthContextType = {
	token: string | null;
	user: any | null;
	login: () => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProviderInner = ({ children }: { children: React.ReactNode }) => {
	const {
		loginWithRedirect,
		logout: auth0Logout,
		user,
		isAuthenticated,
		getIdTokenClaims,
	} = useAuth0();

	const [token, setToken] = useState<string | null>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("auth_token");
		}
		return null;
	});

	useEffect(() => {
		const fetchToken = async () => {
			if (isAuthenticated) {
				const tokenClaims = await getIdTokenClaims();
				const rawToken = tokenClaims?.__raw ?? null;
				setToken(rawToken);

				console.log("JWT Token received:", rawToken); // <-- Add this line

				if (typeof window !== "undefined" && rawToken) {
					localStorage.setItem("auth_token", rawToken);
				}
			} else {
				setToken(null);
				if (typeof window !== "undefined") {
					localStorage.removeItem("auth_token");
				}
			}
		};
		fetchToken();
	}, [isAuthenticated, getIdTokenClaims]);

	const login = () => loginWithRedirect();

	const logout = () => {
		setToken(null);
		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_token");
		}
		auth0Logout({
			logoutParams: {
				returnTo: window.location.origin,
			},
		});
	};

	return (
		<AuthContext.Provider value={{ token, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<Auth0Provider
			domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
			clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
			authorizationParams={{
				redirect_uri: typeof window !== "undefined" ? window.location.origin : "",
			}}
		>
			<AuthProviderInner>{children}</AuthProviderInner>
		</Auth0Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};
