interface TextAreaInputProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	disabled: boolean;
}

export function TextAreaInput({ value, onChange, disabled }: TextAreaInputProps) {
	return (
		<textarea
			value={value}
			onChange={onChange}
			placeholder="What's on your mind?"
			className="w-full resize-none rounded bg-gray-700 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
			rows={4}
			disabled={disabled}
		/>
	);
}
