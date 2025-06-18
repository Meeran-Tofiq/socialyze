"use client";

import { useAuth } from "@web/providers/AuthProvider";

export default function Home() {
	const { user } = useAuth();
	return (
		<>
			<main className="flex h-full flex-1 flex-col items-center justify-center">
				<h1 className="text-4xl font-bold text-blue-600">Hello, and Welcome</h1>
				<h1 className="text-4xl font-bold text-blue-600">To the GREATEST</h1>
				<h1 className="text-4xl font-bold text-blue-600">Social Media App Ever Made!</h1>
				{user && (
					<a
						href="/feed"
						className="relative m-3 text-2xl after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-300 after:content-[''] hover:after:w-full"
					>
						Go to feed
					</a>
				)}
			</main>
		</>
	);
}
