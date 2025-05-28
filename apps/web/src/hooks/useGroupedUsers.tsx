import { useEffect, useState } from "react";
import { useAuth } from "@web/providers/AuthProvider";

type User = {
	_id: string;
	username: string;
	profilePic?: string;
};

type GroupedUsers = {
	following: User[];
	followers: User[];
	pending: User[];
	others: User[];
};

export default function useGroupedUsers() {
	const { token } = useAuth();
	const [data, setData] = useState<GroupedUsers | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!token) return;

		async function fetchUsers() {
			setLoading(true);
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/grouped`, {
				headers: { Authorization: `Bearer ${token}` },
				credentials: "include",
			});
			const json = await res.json();
			setData(json);
			setLoading(false);
		}

		fetchUsers();
	}, [token]);

	return { data, loading };
}
