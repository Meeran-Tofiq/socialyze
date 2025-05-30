"use client";

import Image from "next/image";

interface ProfilePicProps {
	src?: string | null; // optional src string, null or undefined means no image
	alt?: string;
	width?: number;
	height?: number;
	className?: string;
}

export default function ProfilePic({
	src,
	alt = "Profile picture",
	width = 50,
	height = 50,
	className = "",
}: ProfilePicProps) {
	if (!src) return null;

	return (
		<div className={`relative overflow-hidden rounded-full`} style={{ width, height }}>
			<Image
				src={src}
				alt={alt}
				fill
				className={`object-cover ${className}`}
				sizes={`${width}px`}
				priority
			/>
		</div>
	);
}
