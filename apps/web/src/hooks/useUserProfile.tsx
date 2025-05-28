import { useEffect, useState } from "react";
import { UserPublic } from "@socialyze/shared";

export default function useUserProfile(id: string | string[] | undefined, token: string | null) {
	const [profile, setProfile] = useState<UserPublic>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!id || !token) return;

		const fetchProfile = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) throw new Error("Failed to fetch profile");
				const data: UserPublic = await res.json();
				setProfile(data);
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [id, token]);

	return { profile, setProfile, loading, error };
}
