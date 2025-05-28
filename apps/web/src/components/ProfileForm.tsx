"use client";

import { useEffect, useState } from "react";
import { User } from "@socialyze/shared";
import { useAuth } from "./providers/AuthProvider";
import ConfirmModal from "../components/ConfirmModal";
import ProfileImageUploader from "../components/ProfileImageUploader";
import ProfilePic from "./ProfilePic";

export default function ProfileForm() {
	const { token, logout } = useAuth();
	const [formData, setFormData] = useState<Partial<User>>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		async function fetchProfile() {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
					credentials: "include",
					headers: {
						Authorization: `Bearer ${token}`,
					},
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
				body: JSON.stringify({ username: formData.username }), // only send username update
			});
			if (!res.ok) throw new Error("Failed to save");
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
				headers: {
					Authorization: `Bearer ${token}`,
				},
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

	const handleImageUploadComplete = async (key: string) => {
		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/upload-pic`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
				body: JSON.stringify({ key }),
			});
			setFormData((prev) => ({ ...prev, profilePic: key }));
		} catch {
			console.error("Failed to save image key");
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

				{formData.profilePic && <ProfilePic width={128} height={128} />}

				<ProfileImageUploader
					uploadUrlEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/me/upload-url`}
					onUploadCompleteAction={handleImageUploadComplete}
				/>

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
