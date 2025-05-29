"usr client";

import { useEffect, useState } from "react";
import { User, UserPublic } from "@socialyze/shared";
import { useAuth } from "@web/providers/AuthProvider";
import ConfirmModal from "../components/ConfirmModal";
import ProfilePic from "./ProfilePic";
import imageCompression from "browser-image-compression";

export default function ProfileForm() {
	const { token, logout, refetchUser, user } = useAuth();
	const [formData, setFormData] = useState<Partial<User>>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

	// Image upload state
	const [newImageFile, setNewImageFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [uploadUrl, setUploadUrl] = useState<string | null>(null);
	const [newKey, setNewKey] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProfile() {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
					credentials: "include",
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) throw new Error("Failed to fetch");
				const data = await res.json();
				setFormData(data);
			} catch {
				setError("Failed to load profile.");
			} finally {
				setLoading(false);
			}
		}

		if (token) fetchProfile();
	}, [token]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const options = {
			maxSizeMB: 1,
			maxWidthOrHeight: 1024,
			useWebWorker: true,
		};

		try {
			// Compress file first
			const compressedFile = await imageCompression(file, options);

			// Request signed upload URL + key from backend
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload-url`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
				body: JSON.stringify({
					prefix: "uploads",
					fileName: compressedFile.name,
					fileType: compressedFile.type,
				}),
			});

			if (!res.ok) throw new Error("Failed to get upload URL");

			const { uploadUrl, key } = await res.json();

			const preview = URL.createObjectURL(compressedFile);

			// Set local states to be used later on submit
			setNewImageFile(file);
			setNewKey(key);
			setUploadUrl(uploadUrl);
			setPreviewUrl(preview);
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
			// If new image selected, upload it first
			if (newImageFile && uploadUrl && newKey) {
				const uploadRes = await fetch(uploadUrl, {
					method: "PUT",
					headers: { "Content-Type": newImageFile.type },
					body: newImageFile,
				});
				if (!uploadRes.ok) throw new Error("Image upload failed");
			}

			// PATCH profile with username and new profilePic key if exists
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

			setError("");
			// Reset image upload state
			setNewImageFile(null);
			setUploadUrl(null);
			setNewKey(null);
			setPreviewUrl(null);

			refetchUser();
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
			setError("");
			setIsModalOpen(false);
			alert("Profile deleted successfully.");
			logout();
		} catch {
			setError("Failed to delete profile.");
		} finally {
			setDeleting(false);
		}
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p className="text-red-500">{error}</p>;

	return (
		<>
			<form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
				<div>
					<label className="mb-1 block font-medium text-white">Username</label>
					<input
						name="username"
						value={formData.username || ""}
						onChange={handleChange}
						className="w-full rounded border p-2 text-black"
						disabled={saving || deleting}
						required
					/>
				</div>

				{/* Preview local selected image if exists, else existing profile pic */}
				{previewUrl ? (
					<ProfilePic src={previewUrl} width={128} height={128} />
				) : user?.profilePic ? (
					<ProfilePic src={user.profilePic} width={128} height={128} />
				) : null}

				{/* File input for new profile image */}
				<div>
					<label className="mb-1 block font-medium text-white">
						Change Profile Picture
					</label>
					<input type="file" accept="image/*" onChange={handleFileChange} />
				</div>

				<div className="flex items-center justify-between">
					<button
						type="submit"
						disabled={saving || deleting}
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{saving ? "Saving..." : "Save"}
					</button>

					<button
						type="button"
						disabled={saving || deleting}
						onClick={() => setIsModalOpen(true)}
						className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
					>
						Delete Profile
					</button>
				</div>
			</form>

			<ConfirmModal
				isOpen={isModalOpen}
				onConfirmAction={handleDeleteConfirm}
				onCancelAction={() => setIsModalOpen(false)}
				message="Are you sure you want to delete your profile? This action cannot be undone."
			/>
		</>
	);
}
