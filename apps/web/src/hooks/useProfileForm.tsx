import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { useAuth } from "@web/providers/AuthProvider";
import { User, UserPublic } from "@socialyze/shared";

export default function useProfileForm() {
	const { token, logout, refetchUser, user } = useAuth();
	const [formData, setFormData] = useState<Partial<User>>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const [newImageFile, setNewImageFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [uploadUrl, setUploadUrl] = useState<string | null>(null);
	const [newKey, setNewKey] = useState<string | null>(null);

	useEffect(() => {
		if (!token) return;
		(async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
					credentials: "include",
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) throw new Error("Failed to fetch");
				setFormData(await res.json());
			} catch {
				setError("Failed to load profile.");
			} finally {
				setLoading(false);
			}
		})();
	}, [token]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };

		try {
			const compressedFile = await imageCompression(file, options);
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload-url`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
				body: JSON.stringify({
					prefix: "uploads/profile-picture",
					fileName: compressedFile.name,
					fileType: compressedFile.type,
				}),
			});
			if (!res.ok) throw new Error("Failed to get upload URL");
			const { uploadUrl, key } = await res.json();
			setNewImageFile(compressedFile);
			setUploadUrl(uploadUrl);
			setNewKey(key);
			setPreviewUrl(URL.createObjectURL(compressedFile));
			setError("");
		} catch (err) {
			console.error(err);
			setError("Could not prepare image upload.");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			if (newImageFile && uploadUrl && newKey) {
				const uploadRes = await fetch(uploadUrl, {
					method: "PUT",
					headers: { "Content-Type": newImageFile.type },
					body: newImageFile,
				});
				if (!uploadRes.ok) throw new Error("Image upload failed");
			}

			const patchBody: Partial<UserPublic> = { username: formData.username };
			if (newKey) patchBody.profilePic = newKey;

			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
				body: JSON.stringify(patchBody),
			});
			if (!res.ok) throw new Error("Failed to save profile");

			setNewImageFile(null);
			setUploadUrl(null);
			setNewKey(null);
			setPreviewUrl(null);
			refetchUser();
			setError("");
		} catch {
			setError("Failed to save changes.");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteConfirm = async () => {
		setDeleting(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to delete");
			alert("Profile deleted successfully.");
			logout();
		} catch {
			setError("Failed to delete profile.");
		} finally {
			setDeleting(false);
			setIsModalOpen(false);
		}
	};

	return {
		formData,
		setFormData,
		loading,
		saving,
		error,
		handleChange,
		handleSubmit,
		isModalOpen,
		setIsModalOpen,
		handleDeleteConfirm,
		deleting,
		previewUrl,
		handleFileChange,
		user,
	};
}
