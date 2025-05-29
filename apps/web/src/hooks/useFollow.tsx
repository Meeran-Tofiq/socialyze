import { useState } from "react";

export function useFollow({
	userId,
	isFollowing,
	hasRequestedFollow,
	apiBaseUrl,
	token,
	onSuccess,
}: {
	userId: string;
	isFollowing: boolean;
	hasRequestedFollow: boolean;
	apiBaseUrl: string;
	token: string | null;
	onSuccess?: () => void;
}) {
	const [loading, setLoading] = useState(false);

	const handleFollowToggle = async () => {
		setLoading(true);
		const method = isFollowing || hasRequestedFollow ? "DELETE" : "POST";
		const url = `${apiBaseUrl}/follows/${userId}`;

		const res = await fetch(url, {
			method,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.ok && onSuccess) {
			onSuccess();
		}

		setLoading(false);
	};

	const buttonLabel = isFollowing ? "Unfollow" : hasRequestedFollow ? "Cancel Request" : "Follow";

	return {
		loading,
		buttonLabel,
		handleFollowToggle,
	};
}
