import {
  mockCurrentUser,
  mockPosts,
  mockStories,
  mockSpaces,
  mockFiles,
  mockConversations,
  mockMessages,
  mockNotifications,
} from "./mockData";
import type {
  User,
  Post,
  Story,
  Space,
  FileObject,
  Conversation,
  Message,
  Notification,
} from "@/types/domain";

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCurrentUser(): Promise<User> {
  await delay();
  return mockCurrentUser;
}

export async function getFeedPosts(): Promise<Post[]> {
  await delay();
  return [...mockPosts];
}

export async function getStories(): Promise<Story[]> {
  await delay();
  return [...mockStories];
}

export async function getSpaces(): Promise<Space[]> {
  await delay();
  return [...mockSpaces];
}

export async function getFiles(category?: string): Promise<FileObject[]> {
  await delay();
  if (!category || category === "all") {
    return [...mockFiles];
  }
  return mockFiles.filter((f) => f.category === category);
}

export async function getConversations(): Promise<Conversation[]> {
  await delay();
  return [...mockConversations];
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  await delay();
  return mockMessages[conversationId] || [];
}

export async function getNotifications(): Promise<Notification[]> {
  await delay();
  return [...mockNotifications];
}
