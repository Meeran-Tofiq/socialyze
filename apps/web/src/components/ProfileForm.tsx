"use client";

import useProfileForm from "@web/hooks/useProfileForm";
import ConfirmModal from "../components/ConfirmModal";
import ProfileImageInput from "./ProfileImageInput";

export default function ProfileForm() {
	const {
		formData,
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
	} = useProfileForm();

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

				<ProfileImageInput
					previewUrl={previewUrl}
					userPicKey={user?.profilePic}
					onChange={handleFileChange}
					disabled={saving || deleting}
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
