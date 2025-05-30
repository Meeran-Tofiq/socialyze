"use client";

import ProfileForm from "@web/components/ProfileForm";
import { useAuth } from "@web/providers/AuthProvider";

export default function ProfilePage() {
	const { logout } = useAuth();

	return (
		<main className="mx-auto max-w-2xl p-6">
			<div className="flex items-center justify-between gap-5 p-1">
				<h1 className="mb-4 pt-1 text-2xl font-semibold">Your Profile</h1>
				<button onClick={logout} className="rounded bg-white px-3 py-2 text-black">
					Logout
				</button>
			</div>
			<ProfileForm />
		</main>
	);
}
