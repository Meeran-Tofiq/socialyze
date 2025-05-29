import { useState } from "react";
import { PostWithAuthor } from "@socialyze/shared";
import ProfilePic from "./ProfilePic";
import { useAuth } from "@web/providers/AuthProvider";

interface PostCardProps {
	post: PostWithAuthor;
}

export default function PostCard({ post }: PostCardProps) {
	const { user } = useAuth();
	const userId = user?._id ?? "";

	const createdDate = new Date(post.createdAt).toLocaleString();
	const { token } = useAuth();

	const [likes, setLikes] = useState(post.likes);
	const [isToggling, setIsToggling] = useState(false);

	const userHasLiked = likes.includes(userId);

	const toggleLike = async () => {
		if (isToggling) return; // prevent spamming clicks

		setIsToggling(true);

		const originalLikes = likes;

		// Optimistic update
		if (userHasLiked) {
			setLikes((prevLikes) => prevLikes.filter((id) => id !== userId));
		} else {
			setLikes((prevLikes) => [...prevLikes, userId]);
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
			// Rollback on error
			setLikes(originalLikes);
			alert("Error toggling like. Please try again.");
		} finally {
			setIsToggling(false);
		}
	};

	return (
		<div className="mx-auto mb-4 max-w-xl rounded bg-gray-800 p-4 shadow-lg shadow-black/50">
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
			<p className="whitespace-pre-wrap text-gray-200">{post.content}</p>
			<div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
				<button
					onClick={toggleLike}
					disabled={isToggling}
					className={`rounded px-2 py-1 font-semibold transition-colors ${
						userHasLiked
							? "bg-red-600 text-white hover:bg-red-700"
							: "bg-gray-700 hover:bg-gray-600"
					} ${isToggling ? "cursor-not-allowed opacity-50" : ""}`}
				>
					{userHasLiked ? "♥ Liked" : "♡ Like"}
				</button>
				<span>{likes.length} Likes</span>
				<span>{post.comments.length} Comments</span>
			</div>
		</div>
	);
}
