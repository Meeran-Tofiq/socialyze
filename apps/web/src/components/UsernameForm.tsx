import { NeedsUsernameResponse } from "@web/app/auth/callback/page";
import { useState } from "react";

export default function UsernameForm({
	userInfo,
	onSuccess,
}: {
	userInfo: NeedsUsernameResponse;
	onSuccess: (token: string) => void;
}) {
	const [username, setUsername] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		if (!username.trim()) {
			setError("Username is required");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...userInfo, username }),
			});

			if (res.status === 409) {
				setError("Username already taken");
				setLoading(false);
				return;
			}

			if (!res.ok) throw new Error("Failed to create user");

			const data = await res.json();
			onSuccess(data.token);
		} catch {
			setError("Failed to create user");
			setLoading(false);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="mx-auto max-w-md rounded-md border border-gray-700 bg-black p-6 shadow-lg"
		>
			<h2 className="mb-4 text-2xl font-semibold text-white">Choose a username</h2>
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Enter username"
				disabled={loading}
				autoFocus
				required
				className="mb-3 w-full rounded-md px-3 py-2 text-black outline-none focus:ring-2 focus:ring-blue-500"
			/>
			{error && (
				<p className="mb-3 rounded-md border border-red-500 bg-black/70 p-2 text-sm font-medium text-red-500">
					{error}
				</p>
			)}
			<button
				type="submit"
				disabled={loading}
				className="w-full rounded-md bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-600"
			>
				{loading ? "Saving..." : "Save"}
			</button>
		</form>
	);
}
