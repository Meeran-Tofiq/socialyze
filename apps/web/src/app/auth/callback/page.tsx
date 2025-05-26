"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
	const router = useRouter();
	const params = useSearchParams();
	const code = params.get("code");

	useEffect(() => {
		if (!code) {
			router.replace("/"); // no code, go home
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

				if (!res.ok) throw new Error("Token exchange failed");
				const data = await res.json();

				localStorage.setItem("jwt", data.token);
				// You might want to store user in a global store/context here if you use one

				router.replace("/"); // clean URL and go to home
			} catch (error) {
				console.error("Failed to exchange code:", error);
				router.replace("/"); // or show error UI
			}
		}

		exchangeCode();
	}, [code, router]);

	return <p>Logging you in...</p>;
}
