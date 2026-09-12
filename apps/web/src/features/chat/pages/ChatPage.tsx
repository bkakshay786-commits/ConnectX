import { useState, useRef } from "react";
import {
  Search,
  Edit,
  SlidersHorizontal,
  Send,
  Paperclip,
  Mic,
  Phone,
  Video,
  Info,
  Play,
  Pause,
  X,
  FileText,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { mockConversations, mockMessages, mockCurrentUser } from "@/mocks/mockData";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";

export function ChatPage() {
  const [selectedConvId, setSelectedConvId] = useState("conv-elena");
  const [filterType, setFilterType] = useState<"all" | "unread" | "spaces">("all");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv =
    mockConversations.find((c) => c.id === selectedConvId) || mockConversations[0];
  const currentMessages = messages[selectedConvId] || [];

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0) return;

    let content = inputText.trim();
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map((f) => `📎 ${f.name} (${(f.size / 1024).toFixed(0)} KB)`).join("\n");
      content = content ? `${content}\n\n${fileNames}` : fileNames;
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConvId,
      sender: mockCurrentUser,
      content,
      createdAt: "Just now",
      readBy: [],
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMsg],
    }));

    setInputText("");
    setAttachedFiles([]);
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-[360px_1fr] overflow-hidden -mt-4">
      {/* 1. LEFT PANEL: Conversations List */}
      <section className="flex flex-col bg-canvas-lowest/80 backdrop-blur-2xl border-r border-hairline/30 overflow-hidden select-none">
        {/* Search & Header */}
        <div className="p-4 flex flex-col gap-3 border-b border-hairline/20">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-cx-text">Chats</h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toast("New direct conversation")}
                aria-label="New chat"
                className="w-8 h-8 rounded-full bg-surface hover:bg-surface-high text-cx-muted hover:text-primary flex items-center justify-center transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => toast("Conversation filter options")}
                aria-label="Filters"
                className="w-8 h-8 rounded-full bg-surface hover:bg-surface-high text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 w-4 h-4 text-cx-subtle pointer-events-none" />
            <input
              type="text"
              placeholder="Search chats, files, people…"
              className="w-full h-9 pl-9 pr-3 bg-surface-high/70 rounded-full font-body text-xs text-cx-text placeholder:text-cx-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-highest transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={cn(
                "h-7 px-3 rounded-full font-display text-xs font-semibold transition-all",
                filterType === "all"
                  ? "bg-primary-fill text-white shadow-sm"
                  : "bg-surface hover:bg-surface-high text-cx-muted",
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType("unread")}
              className={cn(
                "h-7 px-3 rounded-full font-display text-xs font-semibold transition-all",
                filterType === "unread"
                  ? "bg-primary-fill text-white shadow-sm"
                  : "bg-surface hover:bg-surface-high text-cx-muted",
              )}
            >
              Unread
            </button>
            <button
              type="button"
              onClick={() => setFilterType("spaces")}
              className={cn(
                "h-7 px-3 rounded-full font-display text-xs font-semibold transition-all",
                filterType === "spaces"
                  ? "bg-primary-fill text-white shadow-sm"
                  : "bg-surface hover:bg-surface-high text-cx-muted",
              )}
            >
              Spaces
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {mockConversations.map((conv) => {
            const isSelected = conv.id === selectedConvId;
            const otherUser = conv.participants[0] || mockCurrentUser;
            const title = conv.isGroup ? conv.title : otherUser.displayName;

            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={cn(
                  "p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3",
                  isSelected
                    ? "bg-surface-high/90 shadow-md border border-hairline/40"
                    : "hover:bg-surface/50",
                )}
              >
                <Avatar
                  src={otherUser.avatarUrl}
                  alt={title || "Chat"}
                  size="md"
                  presence={conv.isGroup ? undefined : otherUser.presence}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-display font-semibold text-xs text-cx-text truncate">
                      {title}
                    </h3>
                    <span className="font-display text-[10px] text-cx-subtle">
                      {conv.updatedAt}
                    </span>
                  </div>
                  <p className="font-body text-xs text-cx-muted truncate">
                    {conv.lastMessage?.content}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary-fill text-white font-display text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(124,58,237,0.5)] shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. RIGHT PANEL: Active Conversation Thread */}
      <section className="flex flex-col bg-canvas/60 overflow-hidden">
        {/* Thread Header */}
        <div className="h-16 px-6 bg-surface-low/80 backdrop-blur-xl border-b border-hairline/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={activeConv.participants[0]?.avatarUrl}
              alt={activeConv.title || activeConv.participants[0]?.displayName}
              size="sm"
              presence={activeConv.isGroup ? undefined : activeConv.participants[0]?.presence}
            />
            <div>
              <h3 className="font-display font-semibold text-sm text-cx-text">
                {activeConv.title || activeConv.participants[0]?.displayName}
              </h3>
              <p className="font-body text-[11px] text-secondary">
                {activeConv.isGroup ? "3 members" : "Active now"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast("Starting end-to-end encrypted audio call")}
              aria-label="Audio call"
              className="w-9 h-9 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toast("Starting 4K spatial video call with real-time asset sharing")}
              aria-label="Video call"
              className="w-9 h-9 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toast("Conversation details & shared files vault")}
              aria-label="Details"
              className="w-9 h-9 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
          <div className="text-center my-2">
            <span className="px-3 py-1 rounded-full bg-surface-high text-cx-subtle font-display text-[10px]">
              End-to-End Encrypted Communication Channel
            </span>
          </div>

          {currentMessages.map((msg) => {
            const isMe = msg.sender.id === mockCurrentUser.id;

            return (
              <div
                key={msg.id}
                className={cn("flex flex-col max-w-[80%] sm:max-w-md", isMe ? "ml-auto items-end" : "mr-auto items-start")}
              >
                <div
                  className={cn(
                    "p-3.5 rounded-2xl text-sm font-body leading-relaxed shadow-md",
                    isMe
                      ? "bg-primary-fill text-white rounded-br-none shadow-[0_0_16px_rgba(124,58,237,0.25)]"
                      : "bg-surface-high text-cx-text rounded-bl-none border border-hairline/30",
                  )}
                >
                  {msg.isVoiceNote ? (
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => setIsVoicePlaying(!isVoicePlaying)}
                        aria-label={isVoicePlaying ? "Pause voice memo" : "Play voice memo"}
                        className="w-9 h-9 rounded-full bg-surface-highest text-primary flex items-center justify-center shadow-sm"
                      >
                        {isVoicePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div className="flex-1">
                        <div className="h-1.5 w-full bg-surface-lowest rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full bg-primary rounded-full transition-all",
                              isVoicePlaying ? "w-2/3 animate-pulse" : "w-1/3",
                            )}
                          />
                        </div>
                        <span className="text-[10px] text-cx-muted font-display mt-1 block">
                          Voice note • {msg.voiceDuration || "0:42"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                <span className="text-[10px] text-cx-subtle font-display mt-1 px-1">
                  {msg.createdAt}
                </span>
              </div>
            );
          })}
        </div>

        {/* Message Composer Bar */}
        <div className="bg-surface-low/90 backdrop-blur-xl border-t border-hairline/30">
          {/* Attachment Preview Tray */}
          {attachedFiles.length > 0 && (
            <div className="px-4 pt-3 flex flex-wrap gap-2 items-center">
              {attachedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-high border border-hairline/50 text-xs text-cx-text shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span className="font-display font-medium truncate max-w-[140px]">{file.name}</span>
                  <span className="text-[10px] text-cx-muted font-mono">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    aria-label={`Remove ${file.name}`}
                    className="w-4 h-4 ml-0.5 rounded-full hover:bg-surface-highest flex items-center justify-center text-cx-muted hover:text-cx-text transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 flex items-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleAttachFiles}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach file"
              title="Attach files or 3D assets"
              className="w-10 h-10 rounded-full hover:bg-surface-high text-cx-muted hover:text-primary flex items-center justify-center transition-colors shrink-0 active:scale-95"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send a message, drop a 3D asset, or voice note…"
              className="flex-1 h-11 px-4 bg-surface-high/70 rounded-full text-cx-text placeholder:text-cx-subtle font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-highest transition-all"
            />
            <button
              type="button"
              onClick={() => toast("Hold to record spatial audio memo")}
              aria-label="Record voice note"
              className="w-10 h-10 rounded-full hover:bg-surface-high text-cx-muted hover:text-tertiary flex items-center justify-center transition-colors shrink-0 active:scale-95"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="submit"
              aria-label="Send message"
              className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-fill to-secondary-fill hover:opacity-90 text-white flex items-center justify-center shadow-[0_0_14px_rgba(124,58,237,0.45)] active:scale-95 transition-all shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
