import React from "react";
import ProfilePic from "./ProfilePic";

type Props = {
	previewUrl: string | null;
	userPicKey?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	disabled: boolean;
};

export default function ProfileImageInput({ previewUrl, userPicKey, onChange, disabled }: Props) {
	return (
		<div>
			{previewUrl ? (
				<ProfilePic src={previewUrl} width={128} height={128} />
			) : userPicKey ? (
				<ProfilePic src={userPicKey} width={128} height={128} />
			) : null}

			<label className="mb-1 block font-medium text-white">Change Profile Picture</label>
			<input type="file" accept="image/*" onChange={onChange} disabled={disabled} />
		</div>
	);
}
