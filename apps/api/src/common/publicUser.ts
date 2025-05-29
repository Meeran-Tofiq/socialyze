import { UserPublic } from "@socialyze/shared";
import { generateDownloadUrl } from "./aws/profileImageService";
import { UserDoc } from "@api/endpoints/me/model";

async function getProfilePicUrl(profilePic: string) {
	if (profilePic.startsWith("http")) return profilePic;

	return await generateDownloadUrl(profilePic);
}

export default async function getPublicProfileFromUser(user: UserDoc): Promise<UserPublic> {
	const publicUser: UserPublic = {
		_id: user._id.toString(),
		username: user.username,
		profilePic: await getProfilePicUrl(user.profilePic as string),
		bio: user.bio,
		createdAt: user.createdAt.toISOString(),
		isFollowing: false,
		hasRequestedFollow: false,
		isFollowedByCurrentUser: false,
	};
	return publicUser;
}
