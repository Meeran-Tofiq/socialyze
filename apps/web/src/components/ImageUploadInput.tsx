import React from "react";

interface ImageUploadInputProps {
	disabled: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	inputRef: React.RefObject<HTMLInputElement>;
}

export function ImageUploadInput({ disabled, onChange, inputRef }: ImageUploadInputProps) {
	return (
		<input
			ref={inputRef}
			type="file"
			accept="image/*"
			multiple
			onChange={onChange}
			disabled={disabled}
			className="mt-2"
		/>
	);
}
