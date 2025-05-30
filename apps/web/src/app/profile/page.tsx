"use client";

import PostList from "@web/components/PostList";
import { useAuth } from "@web/providers/AuthProvider";
import { usePosts } from "@web/hooks/usePosts";
import UserHeader from "@web/components/UserHeader";
import { UserPublic } from "@socialyze/shared";

export default function ProfilePage() {
	const { user, logout } = useAuth();

	const url = user ? `${process.env.NEXT_PUBLIC_API_URL}/posts/user/${user._id}` : null;

	const { posts, loading, error } = usePosts(url);

	return (
		<main className="scrollbar-none mx-auto h-screen max-w-2xl overflow-y-auto p-6">
			<div className="flex items-center justify-between gap-5 p-1">
				<UserHeader profile={user as UserPublic} />
				<div className="flex flex-col">
					<button onClick={logout} className="rounded bg-white px-3 py-2 text-black">
						Logout
					</button>
				</div>
			</div>
			{posts && (
				<PostList
					posts={posts}
					loading={loading}
					error={error}
					emptyMessage="No posts yet."
				/>
			)}
		</main>
	);
}
