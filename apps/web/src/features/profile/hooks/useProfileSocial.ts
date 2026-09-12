import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import * as socialApi from "@/features/profile/api/social-api";
import type { ProfileData, PrivacySettingsData } from "@/features/profile/types/social-types";

export function useProfile(identifier?: string) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentProfile = useAuthStore((s) => s.currentProfile);

  return useQuery({
    queryKey: ["profile", identifier || currentUser?.username],
    queryFn: async () => {
      if (!identifier) {
        if (currentProfile) {
          return {
            id: currentProfile.id,
            username: currentProfile.username,
            display_name: currentProfile.display_name,
            avatar_url: currentProfile.avatar_url,
            bio: currentProfile.bio,
            website: currentProfile.website,
            location: currentProfile.location,
            pronouns: currentProfile.pronouns,
          } as ProfileData;
        }
        if (currentUser?.id) {
          return await socialApi.getProfileById(currentUser.id);
        }
        return null;
      }

      // Check if identifier is UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      if (isUuid) {
        return await socialApi.getProfileById(identifier);
      }
      return await socialApi.getProfileByUsername(identifier);
    },
    enabled: Boolean(identifier || currentUser?.username || currentUser?.id),
  });
}

export function useProfileRelationship(targetUserId?: string) {
  return useQuery({
    queryKey: ["profile-relationship", targetUserId],
    queryFn: () => (targetUserId ? socialApi.getProfileRelationship(targetUserId) : null),
    enabled: Boolean(targetUserId),
  });
}

export function useProfileCounts(targetUserId?: string) {
  return useQuery({
    queryKey: ["profile-counts", targetUserId],
    queryFn: () => (targetUserId ? socialApi.getProfileCounts(targetUserId) : null),
    enabled: Boolean(targetUserId),
  });
}

export function usePrivacySettings(userId?: string) {
  return useQuery({
    queryKey: ["privacy-settings", userId || "self"],
    queryFn: () => socialApi.getPrivacySettings(userId),
  });
}

export function useCloseFriends() {
  return useQuery({
    queryKey: ["close-friends"],
    queryFn: () => socialApi.getCloseFriends(),
  });
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ["blocked-users"],
    queryFn: () => socialApi.getBlockedUsers(),
  });
}

export function useMutedUsers() {
  return useQuery({
    queryKey: ["muted-users"],
    queryFn: () => socialApi.getMutedUsers(),
  });
}

export function usePendingFollowRequests() {
  return useQuery({
    queryKey: ["pending-follow-requests"],
    queryFn: () => socialApi.getPendingFollowRequests(),
  });
}

export function useSocialMutations(targetUserId?: string) {
  const queryClient = useQueryClient();

  const invalidateSocialQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["profile-relationship"] });
    queryClient.invalidateQueries({ queryKey: ["profile-counts"] });
    queryClient.invalidateQueries({ queryKey: ["pending-follow-requests"] });
    queryClient.invalidateQueries({ queryKey: ["close-friends"] });
    queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    queryClient.invalidateQueries({ queryKey: ["muted-users"] });
  };

  const followMutation = useMutation({
    mutationFn: () => {
      if (!targetUserId) throw new Error("Target user ID missing");
      return socialApi.followUser(targetUserId);
    },
    onSuccess: invalidateSocialQueries,
  });

  const unfollowMutation = useMutation({
    mutationFn: () => {
      if (!targetUserId) throw new Error("Target user ID missing");
      return socialApi.unfollowUser(targetUserId);
    },
    onSuccess: invalidateSocialQueries,
  });

  const cancelRequestMutation = useMutation({
    mutationFn: () => {
      if (!targetUserId) throw new Error("Target user ID missing");
      return socialApi.cancelFollowRequest(targetUserId);
    },
    onSuccess: invalidateSocialQueries,
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: string) => socialApi.acceptFollowRequest(requestId),
    onSuccess: invalidateSocialQueries,
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: string) => socialApi.rejectFollowRequest(requestId),
    onSuccess: invalidateSocialQueries,
  });

  const blockMutation = useMutation({
    mutationFn: () => {
      if (!targetUserId) throw new Error("Target user ID missing");
      return socialApi.blockUser(targetUserId);
    },
    onSuccess: invalidateSocialQueries,
  });

  const unblockMutation = useMutation({
    mutationFn: () => {
      if (!targetUserId) throw new Error("Target user ID missing");
      return socialApi.unblockUser(targetUserId);
    },
    onSuccess: invalidateSocialQueries,
  });

  const muteMutation = useMutation({
    mutationFn: () => {
      if (!targetUserId) throw new Error("Target user ID missing");
      return socialApi.muteUser(targetUserId);
    },
    onSuccess: invalidateSocialQueries,
  });

  const unmuteMutation = useMutation({
    mutationFn: () => {
      if (!targetUserId) throw new Error("Target user ID missing");
      return socialApi.unmuteUser(targetUserId);
    },
    onSuccess: invalidateSocialQueries,
  });

  const toggleCloseFriendMutation = useMutation({
    mutationFn: (isFriend: boolean) => {
      if (!targetUserId) throw new Error("Target user ID missing");
      return isFriend ? socialApi.removeCloseFriend(targetUserId) : socialApi.addCloseFriend(targetUserId);
    },
    onSuccess: invalidateSocialQueries,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<ProfileData>) => socialApi.updateCurrentProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const updatePrivacySettingsMutation = useMutation({
    mutationFn: (settings: Partial<PrivacySettingsData>) => socialApi.updatePrivacySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-settings"] });
    },
  });

  return {
    followMutation,
    unfollowMutation,
    cancelRequestMutation,
    acceptRequestMutation,
    rejectRequestMutation,
    blockMutation,
    unblockMutation,
    muteMutation,
    unmuteMutation,
    toggleCloseFriendMutation,
    updateProfileMutation,
    updatePrivacySettingsMutation,
  };
}
