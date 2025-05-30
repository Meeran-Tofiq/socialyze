import { useState } from "react";
import { CommentWithAuthor, PostWithAuthorAndComment } from "@socialyze/shared";
import ProfilePic from "./ProfilePic";
import { useAuth } from "@web/providers/AuthProvider";
import NewCommentForm from "./NewCommentForm";
import PostImages from "./PostImages";

interface PostCardProps {
	post: PostWithAuthorAndComment;
}

export default function PostCard({ post }: PostCardProps) {
	const { user, token } = useAuth();
	const userId = user?._id ?? "";

	const createdDate = new Date(post.createdAt).toLocaleString();

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
			<div className="mb-2 flex items-center justify-between gap-2">
				<div className="mb-2 flex items-center gap-2">
					{post.author.profilePic ? (
						<ProfilePic
							src={post.author.profilePic}
							alt={post.author.username}
							width={32}
							height={32}
						/>
					) : (
						<div className="mr-3 h-10 w-10 rounded-full bg-gray-600" />
					)}
					<div>
						<p className="font-semibold text-gray-100">{post.author.username}</p>
						<p className="text-xs text-gray-400">{createdDate}</p>
					</div>
				</div>
				{post.author._id === userId && (
					<button
						onClick={handleDelete}
						disabled={isDeleting}
						className="right-2 top-2 text-red-500 hover:text-red-700"
						aria-label="Delete post"
						title="Delete post"
					>
						🗑️
					</button>
				)}
			</div>

			<p className="whitespace-pre-wrap text-gray-200">{post.content}</p>

			<PostImages images={post.media ?? []} />

			<div className="mt-3 flex items-center space-x-2 text-sm text-gray-400">
				<button
					onClick={toggleLike}
					disabled={isToggling}
					className={`rounded px-2 text-2xl font-semibold transition-colors ${
						userHasLiked
							? "text-red-600 hover:bg-red-700"
							: "text-gray-700 hover:bg-gray-600"
					} ${isToggling ? "cursor-not-allowed opacity-50" : ""}`}
				>
					{userHasLiked ? "♥" : "♡"}
				</button>
				<span>{likes.length} Likes</span>
				<span>{comments && comments.length} Comments</span>
			</div>

			<div className="mt-4 space-y-2 border-t border-gray-700 pt-2">
				{comments &&
					comments.map((comment) => (
						<div key={comment._id} className="text-sm text-gray-300">
							<span className="font-semibold text-gray-200">
								{comment.author ? comment.author.username : "Unknown user"}
							</span>
							: {comment.content}
						</div>
					))}
			</div>

			<NewCommentForm postId={post._id} onCommentCreated={fetchComments} />
		</div>
	);
}
