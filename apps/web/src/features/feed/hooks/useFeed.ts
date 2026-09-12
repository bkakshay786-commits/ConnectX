import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { getStories } from "@/mocks/mockService";
import type { Post } from "@/types/domain";

import { fetchFeedPosts } from "../api/posts-api";

export function useFeedPosts() {
  return useQuery({
    queryKey: queryKeys.feed.home(),
    queryFn: () => fetchFeedPosts(),
  });
}

export function useStories() {
  return useQuery({
    queryKey: ["feed", "stories"],
    queryFn: getStories,
  });
}

export function usePostReactions(postId: string) {
  const queryClient = useQueryClient();

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      // Optimistic local update
      return postId;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.feed.home() });
      const previousPosts = queryClient.getQueryData<Post[]>(queryKeys.feed.home());

      if (previousPosts) {
        queryClient.setQueryData<Post[]>(
          queryKeys.feed.home(),
          previousPosts.map((post) => {
            if (post.id === postId) {
              const isLiked = !post.isLiked;
              return {
                ...post,
                isLiked,
                likeCount: isLiked ? post.likeCount + 1 : Math.max(0, post.likeCount - 1),
              };
            }
            return post;
          }),
        );
      }

      return { previousPosts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.feed.home(), context.previousPosts);
      }
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      return postId;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.feed.home() });
      const previousPosts = queryClient.getQueryData<Post[]>(queryKeys.feed.home());

      if (previousPosts) {
        queryClient.setQueryData<Post[]>(
          queryKeys.feed.home(),
          previousPosts.map((post) => {
            if (post.id === postId) {
              const isBookmarked = !post.isBookmarked;
              return {
                ...post,
                isBookmarked,
                bookmarkCount: isBookmarked
                  ? post.bookmarkCount + 1
                  : Math.max(0, post.bookmarkCount - 1),
              };
            }
            return post;
          }),
        );
      }

      return { previousPosts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.feed.home(), context.previousPosts);
      }
    },
  });

  return {
    toggleLike: toggleLikeMutation.mutate,
    toggleBookmark: toggleBookmarkMutation.mutate,
  };
}
