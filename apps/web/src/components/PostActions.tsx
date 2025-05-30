interface PostActionsProps {
	userHasLiked: boolean;
	likesCount: number;
	commentsCount: number;
	onToggleLike: () => void;
	isToggling: boolean;
}

export default function PostActions({
	userHasLiked,
	likesCount,
	commentsCount,
	onToggleLike,
	isToggling,
}: PostActionsProps) {
	return (
		<div className="mt-3 flex items-center space-x-2 text-sm text-gray-400">
			<button
				onClick={onToggleLike}
				disabled={isToggling}
				className={`rounded px-2 text-2xl font-semibold transition-colors ${
					userHasLiked
						? "text-red-600 hover:bg-red-700"
						: "text-gray-700 hover:bg-gray-600"
				} ${isToggling ? "cursor-not-allowed opacity-50" : ""}`}
			>
				{userHasLiked ? "♥" : "♡"}
			</button>
			<span>{likesCount} Likes</span>
			<span>{commentsCount} Comments</span>
		</div>
	);
}
