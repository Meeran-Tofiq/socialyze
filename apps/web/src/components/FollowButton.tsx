"use client";

import { UserPublic } from "@socialyze/shared";

export default function FollowButton({
	profile,
	token,
	onUpdateAction,
}: {
	profile: UserPublic;
	token: string;
	onUpdateAction: (u: UserPublic) => void;
}) {
	const handleFollow = async () => {
		const baseUrl = process.env.NEXT_PUBLIC_API_URL;
		if (!baseUrl) return;

		const method = profile.isFollowing || profile.hasRequestedFollow ? "DELETE" : "POST";
		const res = await fetch(`${baseUrl}/follows/${profile._id}`, {
			method,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.ok) {
			const updated: UserPublic = await res.json();
			onUpdateAction(updated);
		}
	};

	const buttonText = profile.isFollowing
		? "Unfollow"
		: profile.hasRequestedFollow
			? "Request Sent"
			: "Follow";

	const buttonClass = profile.isFollowing
		? "bg-red-600 hover:bg-red-700"
		: profile.hasRequestedFollow
			? "bg-yellow-600 cursor-not-allowed"
			: "bg-blue-600 hover:bg-blue-700";

	return (
		<button
			onClick={handleFollow}
			className={`rounded px-4 py-2 text-sm font-semibold text-white ${buttonClass}`}
			disabled={profile.hasRequestedFollow}
		>
			{buttonText}
		</button>
	);
}
