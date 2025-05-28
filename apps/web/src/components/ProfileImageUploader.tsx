"use client";

import { useRef, useState } from "react";
import { useAuth } from "@web/providers/AuthProvider";

interface Props {
	uploadUrlEndpoint: string;
	onUploadCompleteAction: (key: string) => void;
}

export default function ProfileImageUploader({ uploadUrlEndpoint, onUploadCompleteAction }: Props) {
	const { token } = useAuth();
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);

		try {
			const res = await fetch(uploadUrlEndpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ fileName: file.name, fileType: file.type }),
			});

			if (!res.ok) throw new Error("Failed to get upload URL");
			const { uploadUrl, key } = await res.json();

			await fetch(uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file,
			});

			onUploadCompleteAction(key);
		} catch (err) {
			console.error("Upload error:", err);
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	return (
		<div>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				disabled={uploading}
			/>
		</div>
	);
}
