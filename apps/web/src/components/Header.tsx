"use client";

import React from "react";
import LoginButton from "./LoginButton";

export default function Header() {
	return (
		<header className="flex w-full items-center justify-between bg-gray-100 px-6 py-4 dark:bg-gray-900">
			<h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Socialyze</h1>
			<div className="ml-auto">
				<LoginButton />
			</div>
		</header>
	);
}
