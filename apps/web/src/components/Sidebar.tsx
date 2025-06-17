"use client";

import useGroupedUsers from "@web/hooks/useGroupedUsers";
import Link from "next/link";
import ProfilePic from "./ProfilePic";
import { useAuth } from "@web/providers/AuthProvider";
import { useSidebar } from "@web/providers/SidebarProvider";

export default function Sidebar() {
	const { data, loading } = useGroupedUsers();
	const { user } = useAuth();
	const { isOpen, close } = useSidebar();

	if (!user || loading) return null;
	if (!data) return <div className="p-4 text-white">No users found.</div>;

	const ClickableUsers = ({ users }: { users: typeof data.following }) => (
		<>
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
						onClick={close}
					>
						{user.username}
					</Link>
				</li>
			))}
		</>
	);

	const Section = ({ title, users }: { title: string; users: typeof data.following }) => (
		<>
			{users.length > 0 && (
				<div className="mb-4">
					<h2 className="mb-2 text-sm font-bold text-gray-400">{title}</h2>
					<ul className="space-y-2">
						<ClickableUsers users={users} />
					</ul>
				</div>
			)}
		</>
	);

	return (
		<>
			{/* Desktop */}
			<aside className="hidden w-64 flex-shrink-0 bg-gray-800 p-4 text-white sm:block">
				<Section title="Following" users={data.following} />
				<Section title="Followers" users={data.followers} />
				<Section title="Pending Requests" users={data.pending} />
				<Section title="Others" users={data.others} />
			</aside>

			{/* Mobile Overlay */}
			{isOpen && (
				<div className="absolute left-0 top-[80px] z-40 flex h-[calc(100vh-64px)] w-full sm:hidden">
					{/* Sidebar panel */}
					<div className="w-64 bg-gray-800 p-4 text-white">
						<Section title="Following" users={data.following} />
						<Section title="Followers" users={data.followers} />
						<Section title="Pending Requests" users={data.pending} />
						<Section title="Others" users={data.others} />
					</div>
					{/* Backdrop */}
					<div className="flex-1 bg-black opacity-50" onClick={close} />
				</div>
			)}
		</>
	);
}
