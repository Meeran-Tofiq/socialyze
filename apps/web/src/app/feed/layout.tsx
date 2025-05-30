"use client";

import Sidebar from "@web/components/Sidebar";

export default function FeedLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-full flex-1">
			<Sidebar />
			<main className="scrollbar scrollbar-thumb-gray-700 scrollbar-track-gray-900 flex-1 overflow-y-auto p-4">
				{children}
			</main>
		</div>
	);
}
