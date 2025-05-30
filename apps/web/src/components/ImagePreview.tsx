import Image from "next/image";

interface ImagePreviewListProps {
	previews: string[];
	onRemove: (index: number) => void;
}

export function ImagePreviewList({ previews, onRemove }: ImagePreviewListProps) {
	return (
		<div className="mt-2 flex flex-wrap gap-2">
			{previews.map((src, i) => (
				<div key={i} className="group relative">
					<Image
						src={src}
						alt={`preview-${i}`}
						width={96}
						height={96}
						className="rounded object-cover"
					/>
					<button
						type="button"
						onClick={() => onRemove(i)}
						className="absolute right-0 top-0 m-1 rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white opacity-80 hover:opacity-100"
						aria-label="Remove image"
					>
						×
					</button>
				</div>
			))}
		</div>
	);
}
