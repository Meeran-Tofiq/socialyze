"use client";

import useGroupedUsers from "@web/hooks/useGroupedUsers";
import Link from "next/link";
import ProfilePic from "./ProfilePic";
import { useAuth } from "@web/providers/AuthProvider";

export default function Sidebar() {
	const { data, loading } = useGroupedUsers();
	const { user } = useAuth();

	if (loading) return <div className="p-4 text-white">Loading users...</div>;
	if (!data) return <div className="p-4 text-white">No users found.</div>;

	const Section = ({ title, users }: { title: string; users: typeof data.following }) => (
		<>
			{users.length > 0 && (
				<div className="mb-4">
					<h2 className="mb-2 text-sm font-bold text-gray-400">{title}</h2>
					<ul className="space-y-2">
						{users.map((user) => (
							<li key={user._id} className="flex items-center gap-2">
								{user.profilePic && (
									<ProfilePic
										src={user.profilePic}
										alt={user.username}
										width={32}
										height={32}
									/>
								)}
								<Link
									href={`/user/${user._id}`}
									className="text-sm text-white hover:underline"
								>
									{user.username}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
		</>
	);

	return user ? (
		<aside className="h-full w-64 overflow-y-auto bg-gray-800 p-4 text-white">
			<Section title="Following" users={data.following} />
			<Section title="Followers" users={data.followers} />
			<Section title="Pending Requests" users={data.pending} />
			<Section title="Others" users={data.others} />
		</aside>
	) : null;
}
