"use client";

import { PostWithAuthor } from "@socialyze/shared";
import PostCard from "@web/components/PostCard";
import { useAuth } from "@web/providers/AuthProvider";
import { useEffect, useState } from "react";

export default function FeedPage() {
	const { token } = useAuth();
	const [posts, setPosts] = useState<PostWithAuthor[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchFeed() {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/feed`, {
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
		}

		if (token) fetchFeed();
		else {
			setPosts([]);
			setLoading(true);
			setError(null);
		}
	}, [token]);

	if (loading) {
		return <div className="mt-10 text-center text-gray-400">Loading feed...</div>;
	}

	if (error) {
		return <div className="mt-10 text-center text-red-500">Error: {error}</div>;
	}

	if (posts.length === 0) {
		return <div className="mt-10 text-center text-gray-400">No posts available.</div>;
	}

	return (
		<main className="min-h-screen bg-gray-950 py-8 text-gray-200">
			<h1 className="mb-6 text-center text-3xl font-bold">Global Feed</h1>
			<div className="space-y-4">
				{posts.map((post) => (
					<PostCard key={post._id} post={post} />
				))}
			</div>
		</main>
	);
}
