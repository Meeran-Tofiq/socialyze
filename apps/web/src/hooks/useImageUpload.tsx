import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

const MAX_IMAGES = 5;

export function useImageUpload() {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [error, setError] = useState<string>("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const fileArray = Array.from(files).slice(0, MAX_IMAGES);

		const compressedFiles: File[] = [];
		const newPreviews: string[] = [];

		try {
			for (const file of fileArray) {
				const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
				const compressedFile = await imageCompression(file, options);
				compressedFiles.push(compressedFile);
				newPreviews.push(URL.createObjectURL(compressedFile));
			}

			previews.forEach(URL.revokeObjectURL);

			setSelectedFiles(compressedFiles);
			setPreviews(newPreviews);
			setError("");
		} catch {
			setError("Failed to process images.");
		}
	};

	const removeImage = (index: number) => {
		setSelectedFiles((files) => files.filter((_, i) => i !== index));
		setPreviews((prev) => {
			URL.revokeObjectURL(prev[index]);
			return prev.filter((_, i) => i !== index);
		});

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return {
		selectedFiles,
		previews,
		error,
		fileInputRef,
		handleFileChange,
		removeImage,
	};
}
