"use client";
import StarryBackground from "@web/components/StarryBackground";
import { useAuth } from "@web/providers/AuthProvider";

export default function Home() {
	const { user } = useAuth();

	return (
		<div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
			<StarryBackground />
			<div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
				<div className="space-y-8 text-center">
					<h1 className="text-2xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-6xl">
						Hello, and Welcome To the GREATEST Social Media App Ever Made!
					</h1>
					{user && (
						<a
							href="/feed"
							className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg transition-colors hover:bg-blue-700"
						>
							Go to feed
						</a>
					)}
				</div>
			</div>
		</div>
	);
}
