import { useState } from "react";
import { CommentWithAuthor, PostWithAuthorAndComment } from "@socialyze/shared";
import { useAuth } from "@web/providers/AuthProvider";

import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import PostComments from "./PostComments";
import NewCommentForm from "./NewCommentForm";

interface PostCardProps {
	post: PostWithAuthorAndComment;
}

export default function PostCard({ post }: PostCardProps) {
	const { user, token } = useAuth();
	const userId = user?._id ?? "";

	const [likes, setLikes] = useState(post.likes);
	const [comments, setComments] = useState<CommentWithAuthor[]>(post.comments);
	const [isToggling, setIsToggling] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const userHasLiked = likes.includes(userId);

	const toggleLike = async () => {
		if (isToggling) return;
		setIsToggling(true);

		const originalLikes = likes;

		if (userHasLiked) {
			setLikes((prev) => prev.filter((id) => id !== userId));
		} else {
			setLikes((prev) => [...prev, userId]);
		}

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post._id}/like`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) throw new Error("Failed to toggle like");

			const updatedPost = await res.json();
			setLikes(updatedPost.likes);
		} catch {
			setLikes(originalLikes);
			alert("Error toggling like. Please try again.");
		} finally {
			setIsToggling(false);
		}
	};

	const fetchComments = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/posts/${post._id}/comments`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await res.json();
			setComments(data);
		} catch {
			alert("Failed to load comments.");
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this post?")) return;
		setIsDeleting(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post._id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Failed to delete post");
			alert("Post deleted successfully");
		} catch {
			alert("Error deleting post. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="mx-auto mb-4 max-w-xl rounded bg-gray-800 p-4 shadow-lg shadow-black/50">
			<PostHeader
				post={post}
				userId={userId}
				onDelete={handleDelete}
				isDeleting={isDeleting}
			/>
			<PostContent content={post.content as string} media={post.media} />
			<PostActions
				userHasLiked={userHasLiked}
				likesCount={likes.length}
				commentsCount={comments.length}
				onToggleLike={toggleLike}
				isToggling={isToggling}
			/>
			<PostComments comments={comments} />
			<NewCommentForm postId={post._id} onCommentCreated={fetchComments} />
		</div>
	);
}
