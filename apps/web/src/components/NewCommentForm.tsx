"use client";

import { useState } from "react";
import { useAuth } from "@web/providers/AuthProvider";

interface NewCommentFormProps {
	postId: string;
	onCommentCreated?: () => void;
}

export default function NewCommentForm({ postId, onCommentCreated }: NewCommentFormProps) {
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { user, token } = useAuth();

	if (!user) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		setIsSubmitting(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content }),
			});

			if (!res.ok) throw new Error("Failed to post comment");

			setContent("");
			if (onCommentCreated) onCommentCreated();
		} catch {
			alert("Error posting comment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="mt-2 flex flex-col space-y-2">
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder="Write a comment..."
				rows={2}
				className="w-full resize-none rounded bg-gray-700 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
				disabled={isSubmitting}
			/>
			<div className="flex justify-end">
				<button
					type="submit"
					disabled={isSubmitting || !content.trim()}
					className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{isSubmitting ? "Posting..." : "Post Comment"}
				</button>
			</div>
		</form>
	);
}
