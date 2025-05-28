"use client";

import Image from "next/image";
import { useAuth } from "@web/providers/AuthProvider";

interface ProfilePicProps {
	width?: number;
	height?: number;
	className?: string;
}

export default function ProfilePic({ width = 40, height = 40, className = "" }: ProfilePicProps) {
	const { user } = useAuth();

	if (!user?.profilePic) return null;

	return (
		<div className={`relative overflow-hidden rounded-full`} style={{ width, height }}>
			<Image
				src={user?.profilePic}
				alt="Profile picture"
				fill
				className={`object-cover ${className}`}
				sizes={`${width}px`}
				priority
			/>
		</div>
	);
}
