import Image from "next/image";

interface PostImagesProps {
	images: string[]; // array of image URLs or keys
}

export default function PostImages({ images }: PostImagesProps) {
	if (!images || images.length === 0) return null;

	return (
		<div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
			{images.map((src, i) => (
				<Image
					key={i}
					src={src}
					alt={`preview-${i}`}
					width={384} // 24 * 4px (tailwind h-24 = 6rem = 96px)
					height={384}
					className="rounded object-cover"
				/>
			))}
		</div>
	);
}
