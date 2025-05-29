"use client";

import { UserPublic } from "@socialyze/shared";
import Link from "next/link";
import { useFollow } from "@web/hooks/useFollow";
import { useAuth } from "@web/providers/AuthProvider";
import ProfilePic from "./ProfilePic";

type Props = {
	user: UserPublic;
	onFollowChangeAction: () => void;
};

export default function UserCard({ user, onFollowChangeAction }: Props) {
	const { token } = useAuth();

	const { loading, buttonLabel, handleFollowToggle } = useFollow({
		userId: user._id,
		isFollowing: user.isFollowing,
		hasRequestedFollow: user.hasRequestedFollow,
		apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
		token,
		onSuccess: onFollowChangeAction,
	});

	if (!token) return null;

	return (
		<div className="flex items-center justify-between rounded-xl border p-4 text-white">
			<Link href={`/user/${user._id}`} className="flex items-center gap-4">
				<ProfilePic
					src={user.profilePic || "/default-avatar.png"}
					alt={user.username}
					width={48}
					height={48}
				/>
				<span className="font-semibold">{user.username}</span>
			</Link>
			<button
				disabled={loading}
				onClick={handleFollowToggle}
				className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
			>
				{buttonLabel}
			</button>
		</div>
	);
}
