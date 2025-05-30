import ProfilePic from "./ProfilePic";
import { PostWithAuthorAndComment } from "@socialyze/shared";

interface PostHeaderProps {
	post: PostWithAuthorAndComment;
	userId: string;
	onDelete: () => void;
	isDeleting: boolean;
}

export default function PostHeader({ post, userId, onDelete, isDeleting }: PostHeaderProps) {
	const createdDate = new Date(post.createdAt).toLocaleString();

	return (
		<div className="mb-2 flex items-center justify-between gap-2">
			<div className="mb-2 flex items-center gap-2">
				{post.author.profilePic ? (
					<ProfilePic
						src={post.author.profilePic}
						alt={post.author.username}
						width={32}
						height={32}
					/>
				) : (
					<div className="mr-3 h-10 w-10 rounded-full bg-gray-600" />
				)}
				<div>
					<p className="font-semibold text-gray-100">{post.author.username}</p>
					<p className="text-xs text-gray-400">{createdDate}</p>
				</div>
			</div>
			{post.author._id === userId && (
				<button
					onClick={onDelete}
					disabled={isDeleting}
					className="right-2 top-2 text-red-500 hover:text-red-700"
					aria-label="Delete post"
					title="Delete post"
				>
					🗑️
				</button>
			)}
		</div>
	);
}
