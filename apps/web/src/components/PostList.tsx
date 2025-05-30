"use client";

import { PostWithAuthorAndComment } from "@socialyze/shared";
import PostCard from "./PostCard";

type PostListProps = {
	posts: PostWithAuthorAndComment[];
	loading: boolean;
	error?: string | null;
	emptyMessage?: string;
};

export default function PostList({ posts, loading, error, emptyMessage }: PostListProps) {
	if (loading) {
		return <div className="mt-10 text-center text-gray-400">Loading feed...</div>;
	}

	if (error) {
		return <div className="mt-10 text-center text-red-500">Error: {error}</div>;
	}

	if (posts.length === 0) {
		return (
			<div className="mt-10 text-center text-gray-400">
				{emptyMessage ?? "No posts available."}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<PostCard key={post._id} post={post} />
			))}
		</div>
	);
}
