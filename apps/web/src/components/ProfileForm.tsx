"use client";

import { useEffect, useState } from "react";
import { User } from "@socialyze/shared";
import { useAuth } from "./providers/AuthProvider";
import ConfirmModal from "../components/ConfirmModal";

export default function ProfileForm() {
	const { token } = useAuth();
	const [formData, setFormData] = useState<Partial<User>>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		async function fetchProfile() {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
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

		if (token) {
			fetchProfile();
		}
	}, [token]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
				body: JSON.stringify(formData),
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
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to delete");
			// Optionally, redirect user or update UI after delete:
			setError("");
			setIsModalOpen(false);
			alert("Profile deleted successfully.");
			// For example: router.push('/') if you use Next.js router
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
					<label className="mb-1 block font-medium">Name</label>
					<input
						name="name"
						value={formData.name || ""}
						onChange={handleChange}
						className="w-full rounded border p-2 text-black"
						disabled={saving || deleting}
					/>
				</div>

				<div>
					<label className="mb-1 block font-medium">Profile Picture URL</label>
					<input
						name="profilePic"
						value={formData.profilePic || ""}
						onChange={handleChange}
						className="w-full rounded border p-2 text-black"
						disabled={saving || deleting}
					/>
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
