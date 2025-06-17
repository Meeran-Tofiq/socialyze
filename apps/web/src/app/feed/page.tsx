"use client";

import PostList from "@web/components/PostList";
import NewPostForm from "@web/components/NewPostForm";
import { useState } from "react";
import { usePosts } from "@web/hooks/usePosts";

export default function FeedPage() {
	const [showFollowingOnly, setShowFollowingOnly] = useState(false);

	const feedUri = showFollowingOnly
		? `${process.env.NEXT_PUBLIC_API_URL}/posts/feed/following`
		: `${process.env.NEXT_PUBLIC_API_URL}/posts/feed`;

	const { posts, loading, error, refetch, hasMore, loadMore } = usePosts(feedUri);

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

			{/* Load More Button */}
			{hasMore && (
				<div className="my-6 flex justify-center">
					<button
						disabled={loading}
						onClick={loadMore}
						className={`rounded px-6 py-3 font-semibold ${
							loading
								? "cursor-not-allowed bg-gray-400"
								: "bg-blue-600 text-white hover:bg-blue-700"
						}`}
					>
						{loading ? "Loading..." : "Load More"}
					</button>
				</div>
			)}
		</>
	);
}
