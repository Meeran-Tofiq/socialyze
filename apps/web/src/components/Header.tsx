"use client";

import React from "react";
import LoginButton from "./LoginButton";
import ProfilePic from "./ProfilePic";
import { useAuth } from "@web/providers/AuthProvider";

export default function Header() {
	const { user } = useAuth();

	return (
		<header className="flex w-full items-center justify-between bg-gray-100 px-6 py-4 dark:bg-gray-900">
			<h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
				<a href="/">Socialyze</a>
			</h1>
			<div className="ml-auto flex space-x-6">
				<LoginButton />
				<a href="profile">
					<ProfilePic
						src={user?.profilePic}
						className="h-14 w-14 rounded-full object-cover"
					/>
				</a>
			</div>
		</header>
	);
}
