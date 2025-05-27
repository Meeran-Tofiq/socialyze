"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "./providers/AuthProvider";

interface ProfilePicProps {
	width?: number;
	height?: number;
	className?: string;
}

export default function ProfilePic({ width = 40, height = 40, className = "" }: ProfilePicProps) {
	const { token, user } = useAuth();
	const [picUrl, setPicUrl] = useState<string | null>(null);
	const imageKey = user?.profilePic;

	useEffect(() => {
		if (!imageKey) return;

		if (imageKey.startsWith("http://") || imageKey.startsWith("https://")) {
			setPicUrl(imageKey);
			return;
		}

		async function fetchSignedUrl() {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/user/profile-pic?key=${encodeURIComponent(imageKey as string)}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				if (!res.ok) throw new Error("Failed to get signed URL");
				const data = await res.json();
				setPicUrl(data.url);
			} catch (err) {
				console.error("Failed to load profile image", err);
			}
		}

		fetchSignedUrl();
	}, [imageKey, token]);

	if (!picUrl) return null;

	return (
		<div className={`relative overflow-hidden rounded-full`} style={{ width, height }}>
			<Image
				src={picUrl}
				alt="Profile picture"
				fill
				className={`object-cover ${className}`}
				sizes={`${width}px`}
				priority
			/>
		</div>
	);
}
