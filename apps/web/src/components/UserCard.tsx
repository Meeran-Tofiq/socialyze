import { User } from "@shared/index";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useState } from "react";

type Props = {
	user: User;
	onFollowChange: () => void;
};

export default function UserCard({ user, onFollowChange }: Props) {
	const [loading, setLoading] = useState(false);

	const handleFollow = async () => {
		setLoading(true);
		const res = await fetch(`/api/follow/${user._id}`, {
			method: user.isFollowing || user.isRequested ? "DELETE" : "POST",
		});
		if (res.ok) onFollowChange();
		setLoading(false);
	};

	return (
		<div className="flex items-center justify-between rounded-xl border p-4">
			<Link href={`/users/${user._id}`} className="flex items-center gap-4">
				<Image
					src={user.profilePic || "/default-avatar.png"}
					alt={user.username}
					className="h-12 w-12 rounded-full"
				/>
				<span className="font-semibold">{user.username}</span>
			</Link>
			<button
				disabled={loading}
				onClick={handleFollow}
				className="rounded bg-blue-500 px-3 py-1 text-sm text-white"
			>
				{user.isFollowing ? "Unfollow" : user.isRequested ? "Cancel Request" : "Follow"}
			</button>
		</div>
	);
}
