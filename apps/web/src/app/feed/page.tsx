"use client";

import NewPostForm from "@web/components/NewPostForm";
import PostList from "@web/components/PostList";
import { useState } from "react";
import { usePosts } from "@web/hooks/usePosts";

export default function FeedPage() {
	const [showFollowingOnly, setShowFollowingOnly] = useState(false);

	const feedUri = showFollowingOnly
		? `${process.env.NEXT_PUBLIC_API_URL}/posts/feed/following`
		: `${process.env.NEXT_PUBLIC_API_URL}/posts/feed`;

	const { posts, loading, error, refetch } = usePosts(feedUri);

	return (
		<>
			<div className="mb-4 flex justify-center gap-4">
				<button
					onClick={() => setShowFollowingOnly(false)}
					className={`rounded px-4 py-2 ${
						!showFollowingOnly ? "bg-blue-600 text-white" : "bg-gray-300 text-black"
					}`}
				>
					Global Feed
				</button>
				<button
					onClick={() => setShowFollowingOnly(true)}
					className={`rounded px-4 py-2 ${
						showFollowingOnly ? "bg-blue-600 text-white" : "bg-gray-300 text-black"
					}`}
				>
					Following
				</button>
			</div>

			<NewPostForm onPostCreated={refetch} />
			<PostList
				posts={posts}
				loading={loading}
				error={error}
				emptyMessage={
					showFollowingOnly
						? "You either follow no one, or they are boring."
						: "No posts available."
				}
			/>
		</>
	);
}
