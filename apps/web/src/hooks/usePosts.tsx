import { useCallback, useEffect, useState } from "react";
import { PostWithAuthorAndComment } from "@socialyze/shared";
import { useAuth } from "@web/providers/AuthProvider";

export function usePosts(endpoint: string | null) {
	const { token } = useAuth();
	const [posts, setPosts] = useState<PostWithAuthorAndComment[]>([]);
	const [loading, setLoading] = useState(false); // initially false
	const [error, setError] = useState<string | null>(null);

	const fetchPosts = useCallback(async () => {
		if (!token || !endpoint) return;

		setLoading(true);
		setError(null);

		try {
			const res = await fetch(endpoint, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);

			const data = await res.json();
			setPosts(data.posts);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "Unknown error");
			}
		} finally {
			setLoading(false);
		}
	}, [token, endpoint]);

	// 💡 wait until both token and endpoint are available
	useEffect(() => {
		if (!token || !endpoint) return;

		fetchPosts();
	}, [token, endpoint, fetchPosts]);

	return { posts, loading, error, refetch: fetchPosts };
}
