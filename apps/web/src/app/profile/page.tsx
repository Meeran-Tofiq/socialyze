import ProfileForm from "@web/components/ProfileForm";

export default function ProfilePage() {
	return (
		<main className="mx-auto max-w-2xl p-6">
			<h1 className="mb-4 text-2xl font-semibold">Your Profile</h1>
			<ProfileForm />
		</main>
	);
}
