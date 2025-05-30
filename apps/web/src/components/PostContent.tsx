import PostImages from "./PostImages";

interface PostContentProps {
	content: string;
	media: string[] | undefined;
}

export default function PostContent({ content, media }: PostContentProps) {
	return (
		<>
			<p className="whitespace-pre-wrap text-gray-200">{content}</p>
			<PostImages images={media ?? []} />
		</>
	);
}
