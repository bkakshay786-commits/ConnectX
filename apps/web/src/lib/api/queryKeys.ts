export const queryKeys = {
  session: {
    currentUser: ["session", "currentUser"] as const,
  },
  feed: {
    home: (cursor?: string) => ["feed", "home", cursor] as const,
  },
  posts: {
    detail: (postId: string) => ["posts", postId] as const,
  },
  files: {
    list: (filter?: string) => ["files", "list", filter] as const,
    detail: (fileId: string) => ["files", fileId] as const,
  },
  spaces: {
    list: ["spaces", "list"] as const,
    detail: (spaceId: string) => ["spaces", spaceId] as const,
  },
  chat: {
    conversations: ["chat", "conversations"] as const,
    messages: (conversationId: string) => ["chat", "messages", conversationId] as const,
  },
  search: {
    query: (term: string) => ["search", term] as const,
  },
  notifications: {
    list: ["notifications"] as const,
  },
} as const;
