"use client";

import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
	const { loginWithRedirect, isAuthenticated, logout, isLoading } = useAuth0();

	if (isLoading) return <p>Loading...</p>;

	return isAuthenticated ? (
		<button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
			Log Out
		</button>
	) : (
		<button onClick={() => loginWithRedirect()}>Log In</button>
	);
}
