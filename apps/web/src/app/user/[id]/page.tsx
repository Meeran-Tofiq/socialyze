"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@web/providers/AuthProvider";
import UserHeader from "@web/components/UserHeader";
import FollowButton from "@web/components/FollowButton";
import useUserProfile from "@web/hooks/useUserProfile"; // adjust path if needed

export default function UserProfilePage() {
	const { id } = useParams();
	const { user: currentUser, token } = useAuth();
	const { profile, setProfile, loading, error } = useUserProfile(id, token);

	if (!token) return null;
	if (loading) return <div className="p-4 text-white">Loading...</div>;
	if (error || !profile) return <div className="p-4 text-red-500">User not found</div>;

	const isSelf = currentUser?._id === profile._id;

	return (
		<div className="p-6 text-white">
			<UserHeader profile={profile} />
			{!isSelf && (
				<>
					{profile.isFollowedByCurrentUser && (
						<p className="mb-2 text-sm text-green-400">Follows you</p>
					)}
					<FollowButton profile={profile} token={token} onUpdateAction={setProfile} />
				</>
			)}
		</div>
	);
}
