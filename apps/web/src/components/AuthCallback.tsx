"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@web/providers/AuthProvider";
import UsernameForm from "@web/components/UsernameForm";

export type NeedsUsernameResponse = {
	needsUsername: boolean;
	email: string;
	name?: string;
	profilePic?: string;
	sub: string;
};

export default function AuthCallback() {
	const router = useRouter();
	const params = useSearchParams();
	const { setToken } = useAuth(); // Get setToken from AuthProvider
	const code = params.get("code");
	const [needsUsernameData, setNeedsUsernameData] = useState<NeedsUsernameResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!code) {
			router.replace("/");
			return;
		}

		async function exchangeCode() {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/callback?code=${code}`,
					{
						method: "GET",
						credentials: "include",
					},
				);

				if (res.status === 404) {
					// User needs to enter username
					const data = (await res.json()) as NeedsUsernameResponse;
					setNeedsUsernameData(data);
					setLoading(false);
					return;
				}

				if (!res.ok) throw new Error("Token exchange failed");

				const data = await res.json();
				// Use AuthProvider's setToken method - this will update state immediately
				setToken(data.token);
				router.replace("/");
			} catch (error) {
				console.error("Failed to exchange code:", error);
				router.replace("/");
			}
		}

		exchangeCode();
	}, [code, router, setToken]);

	if (loading && !needsUsernameData) return <p>Logging you in...</p>;

	if (needsUsernameData)
		return (
			<UsernameForm
				userInfo={needsUsernameData}
				onSuccess={(token) => {
					// Use AuthProvider's setToken method here too
					setToken(token);
					router.replace("/");
				}}
			/>
		);

	return null; // shouldn't happen
}
