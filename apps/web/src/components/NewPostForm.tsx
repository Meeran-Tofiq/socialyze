"use client";

import { useAuth } from "@web/providers/AuthProvider";
import { useState } from "react";
import { ImageUploadInput } from "./ImageUploadInput";
import { useImageUpload } from "@web/hooks/useImageUpload";
import { uploadImages } from "@web/utility/uploadImage";
import { ImagePreviewList } from "./ImagePreview";
import { TextAreaInput } from "./TextAreaInput";

interface NewPostFormProps {
	onPostCreated?: () => void;
}

export default function NewPostForm({ onPostCreated }: NewPostFormProps) {
	const { token, user } = useAuth();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { selectedFiles, previews, error, fileInputRef, handleFileChange, removeImage } =
		useImageUpload();
	const [formError, setFormError] = useState("");

	if (!user) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim() && selectedFiles.length === 0) {
			setFormError("Please enter content or select at least one image.");
			return;
		}

		setIsSubmitting(true);
		setFormError("");

		try {
			const keys = await uploadImages(token!, selectedFiles);

			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content, mediaUrl: keys }),
			});

			if (!res.ok) throw new Error("Failed to create post");

			setContent("");
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			previews.forEach(URL.revokeObjectURL);

			if (onPostCreated) onPostCreated();
		} catch (err: unknown) {
			setFormError((err as Error).message || "Error creating post.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mx-auto mb-6 max-w-xl rounded bg-gray-800 p-4 shadow-lg shadow-black/50"
		>
			<TextAreaInput
				value={content}
				onChange={(e) => setContent(e.target.value)}
				disabled={isSubmitting}
			/>

			<ImageUploadInput
				disabled={isSubmitting}
				onChange={handleFileChange}
				inputRef={fileInputRef}
			/>

			{previews.length > 0 && <ImagePreviewList previews={previews} onRemove={removeImage} />}

			{(error || formError) && <p className="mt-2 text-red-500">{error || formError}</p>}

			<div className="mt-2 flex justify-end">
				<button
					type="submit"
					disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
					className="rounded bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSubmitting ? "Posting..." : "Post"}
				</button>
			</div>
		</form>
	);
}
