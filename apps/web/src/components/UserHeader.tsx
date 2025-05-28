import ProfilePic from "./ProfilePic";
import { UserPublic } from "@socialyze/shared";

export default function UserHeader({ profile }: { profile: UserPublic }) {
	return (
		<div className="mb-4 flex items-center gap-4">
			<ProfilePic src={profile.profilePic} alt={profile.username} width={64} height={64} />
			<div>
				<h1 className="text-2xl font-bold">{profile.username}</h1>
				<p className="text-sm text-gray-400">
					{new Date(profile.createdAt).toDateString()}
				</p>
			</div>
		</div>
	);
}
