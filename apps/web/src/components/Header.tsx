"use client";

import React from "react";
import LoginButton from "./LoginButton";
import ProfilePic from "./ProfilePic";
import { useAuth } from "@web/providers/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons"; // or another icon if you prefer
import { useSidebar } from "@web/providers/SidebarProvider";

export default function Header() {
	const { user } = useAuth();
	const sidebar = useSidebar();

	return (
		<header className="flex h-20 w-full items-center justify-between bg-gray-100 px-5 py-4 dark:bg-gray-900">
			{/* Left: Hamburger menu on mobile */}
			<div className="flex items-center sm:hidden">
				<button
					onClick={sidebar?.toggle}
					className="text-gray-800 dark:text-white"
					aria-label="Toggle sidebar"
				>
					<FontAwesomeIcon icon={faBars} className="h-6 w-6" />
				</button>
			</div>

			{/* Center: Socialyze logo - centered on mobile, left-aligned on desktop */}
			<div className="flex flex-1 items-center justify-center gap-5 text-center sm:justify-start sm:text-left">
				<h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
					<a href={"/"}>Socialyze</a>
				</h1>
				{user && (
					<>
						{" | "}
						<h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
							<a href="/feed">Feed</a>
						</h3>
					</>
				)}
			</div>

			{/* Right: Login/Profile */}
			<div className="items-center space-x-6">
				{!user && <LoginButton />}
				{user && (
					<a href="/profile">
						<div className="flex items-center gap-5 p-1">
							<h3 className="hidden sm:block">{user?.username}</h3>
							<ProfilePic
								src={user?.profilePic}
								className="h-14 w-14 rounded-full object-cover"
							/>
						</div>
					</a>
				)}
			</div>
		</header>
	);
}
