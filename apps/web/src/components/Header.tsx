"use client";

import React from "react";
import LoginButton from "./LoginButton";
import ProfilePic from "./ProfilePic";
import { useAuth } from "@web/providers/AuthProvider";

export default function Header() {
	const { user } = useAuth();

	return (
		<header className="flex w-full items-center justify-between bg-gray-100 px-5 py-4 dark:bg-gray-900">
			<h1 className="text-5xl font-bold text-gray-800 dark:text-gray-200">
				<a href={user ? "/feed" : "/"}>Socialyze</a>
			</h1>
			<div className="ml-auto flex space-x-6">
				{!user && <LoginButton />}
				<a href="profile">
					<div className="flex items-center justify-between gap-5 p-1">
						<h3>{user?.username}</h3>
						<ProfilePic
							src={user?.profilePic}
							className="h-14 w-14 rounded-full object-cover"
						/>
					</div>
				</a>
			</div>
		</header>
	);
}
