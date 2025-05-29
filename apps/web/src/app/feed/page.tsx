"use client";

import { PostWithAuthorAndComment } from "@socialyze/shared";
import NewPostForm from "@web/components/NewPostForm";
import PostCard from "@web/components/PostCard";
import { useAuth } from "@web/providers/AuthProvider";
import { useCallback, useEffect, useState } from "react";

export default function FeedPage() {
	const { token } = useAuth();
	const [posts, setPosts] = useState<PostWithAuthorAndComment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showFollowingOnly, setShowFollowingOnly] = useState(false);

	const feedUri = showFollowingOnly
		? `${process.env.NEXT_PUBLIC_API_URL}/posts/feed/following`
		: `${process.env.NEXT_PUBLIC_API_URL}/posts/feed`;

	const fetchFeed = useCallback(async () => {
		if (!token) return;

		try {
			const res = await fetch(feedUri, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(`Failed to fetch feed: ${res.statusText}`);

			const data = await res.json();
			setPosts(data.posts);
			setError(null);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "Unknown error");
			}
		} finally {
			setLoading(false);
		}
	}, [token, feedUri]);

	useEffect(() => {
		if (token) {
			setLoading(true);
			fetchFeed();
		} else {
			setPosts([]);
			setLoading(true);
			setError(null);
		}
	}, [token, fetchFeed]);

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

			{loading ? (
				<div className="mt-10 text-center text-gray-400">Loading feed...</div>
			) : error ? (
				<div className="mt-10 text-center text-red-500">Error: {error}</div>
			) : posts.length === 0 ? (
				<div className="mt-10 text-center text-gray-400">No posts available.</div>
			) : (
				<>
					<NewPostForm onPostCreated={fetchFeed} />
					<div className="space-y-4">
						{posts.map((post) => (
							<PostCard key={post._id} post={post} />
						))}
					</div>
				</>
			)}
		</>
	);
}
