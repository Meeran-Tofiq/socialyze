"use client";

interface ConfirmModalProps {
	isOpen: boolean;
	onConfirmAction: () => void;
	onCancelAction: () => void;
	message?: string;
}

export default function ConfirmModal({
	isOpen,
	onConfirmAction,
	onCancelAction,
	message = "Are you sure you want to delete your profile? This action cannot be undone.",
}: ConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
			<div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-lg">
				<p className="mb-6 text-center text-lg text-black">{message}</p>
				<div className="flex justify-center space-x-4">
					<button
						onClick={onCancelAction}
						className="rounded border border-gray-300 px-4 py-2 text-black hover:bg-gray-100"
					>
						Cancel
					</button>
					<button
						onClick={onConfirmAction}
						className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}
