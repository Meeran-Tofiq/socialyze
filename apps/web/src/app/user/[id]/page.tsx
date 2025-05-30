"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@web/providers/AuthProvider";
import UserHeader from "@web/components/UserHeader";
import FollowButton from "@web/components/FollowButton";
import useUserProfile from "@web/hooks/useUserProfile"; // adjust path if needed
import PostList from "@web/components/PostList";
import { usePosts } from "@web/hooks/usePosts";

export default function UserProfilePage() {
	const { id } = useParams();
	const { user: currentUser, token } = useAuth();
	const { profile, setProfile, loading, error } = useUserProfile(id, token);
	const url = `${process.env.NEXT_PUBLIC_API_URL}/posts/user/${id}`;

	const { posts, loading: postLoading, error: postError } = usePosts(url);

	if (!token) return null;
	if (loading) return <div className="p-4 text-white">Loading...</div>;
	if (error || !profile) return <div className="p-4 text-red-500">User not found</div>;

	const isSelf = currentUser?._id === profile._id;

	return (
		<div className="mx-auto flex w-fit flex-col items-center justify-center justify-between p-6 text-white">
			<div className="flex w-full items-center justify-between">
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
			{posts && (
				<PostList
					posts={posts}
					loading={postLoading}
					error={postError}
					emptyMessage="No posts yet."
				/>
			)}
		</div>
	);
}
