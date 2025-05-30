"use client";

import React from "react";
import { useState } from "react";

type Props = {
	onImageSelectedAction: (file: File, key: string, previewUrl: string, uploadUrl: string) => void;
	uploadUrlEndpoint: string;
};

export default function ProfileImageUploader({ onImageSelectedAction, uploadUrlEndpoint }: Props) {
	const [error, setError] = useState("");

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			// Request signed upload URL and key from backend
			const res = await fetch(uploadUrlEndpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					prefix: "uploads",
					fileName: file.name,
					fileType: file.type,
				}),
			});

			if (!res.ok) throw new Error("Failed to get upload URL");

			const { uploadUrl, key } = await res.json();

			const previewUrl = URL.createObjectURL(file);

			// Pass everything to parent to handle actual upload later
			onImageSelectedAction(file, key, previewUrl, uploadUrl);
			setError("");
		} catch (err) {
			console.error(err);
			setError("Could not prepare image upload.");
		}
	};

	return (
		<div>
			<label className="mb-1 block font-medium text-white">Change Profile Picture</label>
			<input type="file" accept="image/*" onChange={handleFileChange} />
			{error && <p className="mt-2 text-red-500">{error}</p>}
		</div>
	);
}
