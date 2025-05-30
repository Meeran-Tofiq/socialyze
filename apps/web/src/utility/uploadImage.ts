export async function uploadImages(
	token: string,
	selectedFiles: File[],
	prefix = "uploads/post",
): Promise<string[]> {
	const keys: string[] = [];

	for (const file of selectedFiles) {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload-url`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				prefix,
				fileName: file.name,
				fileType: file.type,
			}),
		});
		if (!res.ok) throw new Error("Failed to get upload URL");

		const { uploadUrl, key } = await res.json();

		const uploadRes = await fetch(uploadUrl, {
			method: "PUT",
			headers: { "Content-Type": file.type },
			body: file,
		});
		if (!uploadRes.ok) throw new Error("Image upload failed");

		keys.push(key);
	}

	return keys;
}
