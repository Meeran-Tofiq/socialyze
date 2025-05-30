import { useState } from "react";
import ProfilePic from "./ProfilePic";
import ConfirmModal from "./ConfirmModal"; // make sure this path is correct
import { PostWithAuthorAndComment } from "@socialyze/shared";

interface PostHeaderProps {
	post: PostWithAuthorAndComment;
	userId: string;
	onDelete: () => void;
	isDeleting: boolean;
}

export default function PostHeader({ post, userId, onDelete, isDeleting }: PostHeaderProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const createdDate = new Date(post.createdAt).toLocaleString();

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	const confirmDelete = () => {
		onDelete();
		closeModal();
	};

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
				<>
					<button
						onClick={openModal}
						disabled={isDeleting}
						className="right-2 top-2 text-red-500 hover:text-red-700"
						aria-label="Delete post"
						title="Delete post"
					>
						🗑️
					</button>

					<ConfirmModal
						isOpen={isModalOpen}
						onConfirmAction={confirmDelete}
						onCancelAction={closeModal}
						message="Are you sure you want to delete this post? This action cannot be undone."
					/>
				</>
			)}
		</div>
	);
}
