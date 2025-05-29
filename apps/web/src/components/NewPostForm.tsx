"use client";

import { useAuth } from "@web/providers/AuthProvider";
import { useState } from "react";

interface NewPostFormProps {
	onPostCreated?: () => void;
}

export default function NewPostForm({ onPostCreated }: NewPostFormProps) {
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { token, user } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		setIsSubmitting(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content }),
			});

			if (!res.ok) throw new Error("Failed to create post");

			setContent("");
			if (onPostCreated) onPostCreated();
		} catch {
			alert("Error creating post. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) return null;

	return (
		<form
			onSubmit={handleSubmit}
			className="mx-auto mb-6 max-w-xl rounded bg-gray-800 p-4 shadow-lg shadow-black/50"
		>
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder="What's on your mind?"
				className="w-full resize-none rounded bg-gray-700 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
				rows={4}
				disabled={isSubmitting}
			/>
			<div className="mt-2 flex justify-end">
				<button
					type="submit"
					disabled={isSubmitting || !content.trim()}
					className={`rounded bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50`}
				>
					{isSubmitting ? "Posting..." : "Post"}
				</button>
			</div>
		</form>
	);
}
