import { CommentWithAuthor } from "@socialyze/shared";

interface PostCommentsProps {
	comments: CommentWithAuthor[];
}

export default function PostComments({ comments }: PostCommentsProps) {
	return (
		<div className="mt-4 space-y-2 border-t border-gray-700 pt-2">
			{comments.map((comment) => (
				<div key={comment._id} className="text-sm text-gray-300">
					<span className="font-semibold text-gray-200">
						{comment.author ? comment.author.username : "Unknown user"}
					</span>
					: {comment.content}
				</div>
			))}
		</div>
	);
}
