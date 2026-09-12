import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  fetchFeedPosts,
  createPost,
  updatePost,
  deletePost,
} from "../api/posts-api";
import type { CreatePostInput, UpdatePostInput, FeedFilter } from "../types/post-types";
import { toast } from "@/components/ui/Toaster";

export function useFeedPostsQuery(filter?: FeedFilter) {
  return useQuery({
    queryKey: [...queryKeys.feed.home(), filter?.visibility, filter?.post_type, filter?.author_id],
    queryFn: () => fetchFeedPosts(filter),
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed", "home"] });
      toast.success("Post published successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to publish post.");
    },
  });
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, input }: { postId: string; input: UpdatePostInput }) =>
      updatePost(postId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed", "home"] });
      toast.success("Post updated.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update post.");
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed", "home"] });
      toast.success("Post deleted.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete post.");
    },
  });
}
