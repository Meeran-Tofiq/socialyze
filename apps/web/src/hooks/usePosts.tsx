import { useCallback, useEffect, useState } from "react";
import { PostWithAuthorAndComment } from "@socialyze/shared";
import { useAuth } from "@web/providers/AuthProvider";

export function usePosts(endpointBase: string | null) {
	const { token } = useAuth();
	const [posts, setPosts] = useState<PostWithAuthorAndComment[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const fetchPosts = useCallback(
		async (pageToLoad: number) => {
			if (!token || !endpointBase) return;
			setLoading(true);
			setError(null);

			try {
				const res = await fetch(`${endpointBase}?page=${pageToLoad}&limit=20`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);

				const data = await res.json();

				if (pageToLoad === 1) {
					setPosts(data.posts);
				} else {
					setPosts((prev) => [...prev, ...data.posts]);
				}

				setHasMore(data.hasMore);
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError(err.message || "Unknown error");
				}
			} finally {
				setLoading(false);
			}
		},
		[token, endpointBase],
	);

	useEffect(() => {
		if (!token || !endpointBase) return;
		setPage(1);
		fetchPosts(1);
	}, [token, endpointBase, fetchPosts]);

	const loadMore = () => {
		if (loading || !hasMore) return;
		const nextPage = page + 1;
		setPage(nextPage);
		fetchPosts(nextPage);
	};

	return { posts, loading, error, refetch: () => fetchPosts(1), loadMore, hasMore };
}
