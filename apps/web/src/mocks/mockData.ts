import type {
  User,
  Story,
  Post,
  Space,
  FileObject,
  Conversation,
  Message,
  Notification,
} from "@/types/domain";

export const mockCurrentUser: User = {
  id: "user-maya",
  username: "mayalin",
  displayName: "Maya Lin",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  bio: "Spatial Interface Designer & Creative Technologist. Building procedural rendering pipelines and cross-reality ecosystems.",
  verified: true,
  presence: "online",
  followersCount: 14200,
  followingCount: 382,
  spacesCount: 8,
};

export const mockUsers: Record<string, User> = {
  emily: {
    id: "user-emily",
    username: "emily_designs",
    displayName: "Emily Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    bio: "Creative Director @ Spatial Studio. Obsessed with micro-interactions & neon typography.",
    verified: true,
    presence: "online",
    followersCount: 28400,
    followingCount: 412,
  },
  alex: {
    id: "user-alex",
    username: "alexchen",
    displayName: "Alex Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    bio: "Titanium frames & ambient architectures.",
    verified: true,
    presence: "online",
    followersCount: 8900,
    followingCount: 210,
  },
  elena: {
    id: "user-elena",
    username: "elena_art",
    displayName: "Elena Rostova",
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80",
    bio: "Digital artist & sound designer. Exploring atmospheric audio waves and chromatic diffusion.",
    verified: true,
    presence: "online",
    followersCount: 34100,
    followingCount: 520,
  },
  liam: {
    id: "user-liam",
    username: "liam_3d",
    displayName: "Liam Gallagher",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    bio: "3D procedural artist & avatar rigger.",
    verified: false,
    presence: "idle",
    followersCount: 6300,
    followingCount: 195,
  },
  marcus: {
    id: "user-marcus",
    username: "marcus_r",
    displayName: "Marcus Reed",
    avatarUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80",
    bio: "Sound engineer & spatial audio researcher.",
    verified: true,
    presence: "offline",
    followersCount: 11200,
    followingCount: 304,
  },
};

export const mockStories: Story[] = [
  {
    id: "story-self",
    user: mockCurrentUser,
    mediaUrl: "",
    previewUrl: mockCurrentUser.avatarUrl,
    createdAt: "Just now",
    hasUnseen: false,
  },
  {
    id: "story-elena",
    user: mockUsers.elena,
    mediaUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    previewUrl: mockUsers.elena.avatarUrl,
    createdAt: "15m ago",
    hasUnseen: true,
  },
  {
    id: "story-alex",
    user: mockUsers.alex,
    mediaUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
    previewUrl: mockUsers.alex.avatarUrl,
    createdAt: "1h ago",
    hasUnseen: true,
  },
  {
    id: "story-space",
    user: {
      id: "space-motion",
      username: "motion_guild",
      displayName: "Motion & Spatial Guild",
      avatarUrl:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80",
      verified: true,
    },
    mediaUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    previewUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80",
    createdAt: "2h ago",
    hasUnseen: true,
    isLiveSpace: true,
    spaceTitle: "Audio Stage Active",
  },
  {
    id: "story-emily",
    user: mockUsers.emily,
    mediaUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
    previewUrl: mockUsers.emily.avatarUrl,
    createdAt: "4h ago",
    hasUnseen: false,
  },
  {
    id: "story-liam",
    user: mockUsers.liam,
    mediaUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    previewUrl: mockUsers.liam.avatarUrl,
    createdAt: "6h ago",
    hasUnseen: false,
  },
];

export const mockFiles: FileObject[] = [
  {
    id: "file-figma-kit",
    name: "Spatial_Interaction_Kit.fig",
    extension: ".fig",
    sizeBytes: 88291430, // 84.2 MB
    url: "/downloads/Spatial_Interaction_Kit.fig",
    mimeType: "application/x-figma",
    createdAt: "2h ago",
    uploadedBy: mockUsers.emily,
    version: "v2.4",
    permission: "public",
    category: "docs",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    aiSummary: "Comprehensive design system kit including 120+ spatial UI primitives and token variables.",
    downloadCount: 384,
    scanStatus: "clean",
  },
  {
    id: "file-pdf-guidelines",
    name: "Spatial_UX_Architecture.pdf",
    extension: ".pdf",
    sizeBytes: 15518924, // 14.8 MB
    url: "/downloads/Spatial_UX_Architecture.pdf",
    mimeType: "application/pdf",
    createdAt: "Yesterday",
    uploadedBy: mockCurrentUser,
    version: "v3.0 Final",
    permission: "public",
    category: "docs",
    pageCount: 28,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80",
    aiSummary: "Parametric spring mechanics for spatial hand anchors, depth tokens, and gesture curves.",
    downloadCount: 1205,
    scanStatus: "clean",
  },
  {
    id: "file-quantum-blend",
    name: "Quantum_Shader_Pack_v2.blend",
    extension: ".blend",
    sizeBytes: 148897792, // 142 MB
    url: "/downloads/Quantum_Shader_Pack_v2.blend",
    mimeType: "application/x-blender",
    createdAt: "3 days ago",
    uploadedBy: mockUsers.liam,
    version: "v2.0",
    permission: "space",
    category: "3d",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&auto=format&fit=crop&q=80",
    aiSummary: "Procedural ray-marched volumetrics & chromatic dispersion shaders for real-time engines.",
    downloadCount: 420,
    scanStatus: "clean",
  },
  {
    id: "file-audio-stems",
    name: "Neon_Horizon_Stem_Master.wav",
    extension: ".wav",
    sizeBytes: 68157440, // 65 MB
    url: "/downloads/Neon_Horizon_Stem_Master.wav",
    mimeType: "audio/wav",
    createdAt: "4 days ago",
    uploadedBy: mockUsers.elena,
    version: "Master 48kHz",
    permission: "public",
    category: "audio",
    aiSummary: "Stereo stem master featuring analog synth bassline and reactive binaural vocal pads.",
    downloadCount: 890,
    scanStatus: "clean",
  },
  {
    id: "file-code-shaders",
    name: "Neural_Core_Shaders.glsl",
    extension: ".glsl",
    sizeBytes: 4404019, // 4.2 MB
    url: "/downloads/Neural_Core_Shaders.glsl",
    mimeType: "text/plain",
    createdAt: "5 days ago",
    uploadedBy: mockUsers.alex,
    version: "v1.8",
    permission: "encrypted",
    category: "code",
    aiSummary: "GLSL fragment kernel with 120Hz target rate compute pass.",
    downloadCount: 180,
    scanStatus: "clean",
  },
];

export const mockPosts: Post[] = [
  {
    id: "post-1",
    author: mockUsers.emily,
    createdAt: "2h ago",
    contextReason: "Why am I seeing this? • Following @emily_designs",
    content: {
      kind: "media",
      media: [
        {
          id: "m1",
          type: "image",
          url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
          altText: "Kinetic geometric liquid chrome sculpture floating inside dark space with luminous magenta and azure accents",
        },
      ],
      caption:
        "Finalizing the spatial haptics and glass refraction passes for our new immersive stage ecosystem. Light bending around tactile digital boundaries feels so physical. What do you think of the luminous cyan rim highlights?",
    },
    likeCount: 1420,
    commentCount: 86,
    shareCount: 42,
    bookmarkCount: 230,
    isLiked: false,
    isBookmarked: false,
    tags: ["SpatialDesign", "VisionPro", "ConnectX", "3DUI"],
  },
  {
    id: "post-2",
    author: mockUsers.emily,
    createdAt: "4h ago",
    contextReason: "Based on your Spaces • Motion & Spatial Guild",
    content: {
      kind: "file",
      file: mockFiles[0], // Spatial_Interaction_Kit.fig
      description:
        "Dropped the complete component architecture kit with responsive tokens, gesture curve math, and dark glass styles for everyone in the guild. Duplicate directly or branch into your project!",
    },
    likeCount: 438,
    commentCount: 29,
    shareCount: 114,
    bookmarkCount: 312,
    isLiked: true,
    isBookmarked: true,
    isForked: false,
    tags: ["DesignTokens", "Figma", "DesignSystems"],
  },
  {
    id: "post-3",
    author: mockUsers.elena,
    createdAt: "6h ago",
    contextReason: "Trending in Audio Stems",
    content: {
      kind: "audio",
      media: {
        id: "m-audio-1",
        type: "audio",
        url: "https://actions.google.com/sounds/v1/science_fiction/scifi_laser_1.ogg",
        durationSeconds: 142,
      },
      title: "Neon Horizon (Atmospheric Stems)",
      artist: "Elena Rostova",
      waveform: [20, 35, 60, 45, 80, 95, 70, 50, 85, 100, 75, 60, 90, 65, 40, 55, 70, 90, 80, 60, 40, 25],
      description: "Recorded live during yesterday's spatial audio stage session. High dynamic range analog harmonics with reactive sub-bass.",
    },
    likeCount: 892,
    commentCount: 44,
    shareCount: 68,
    bookmarkCount: 194,
    isLiked: false,
    isBookmarked: false,
    tags: ["SpatialAudio", "Synthwave", "Stems"],
  },
  {
    id: "post-4",
    author: mockUsers.liam,
    createdAt: "8h ago",
    contextReason: "Why am I seeing this? • Space Member",
    content: {
      kind: "file",
      file: mockFiles[2], // Quantum_Shader_Pack_v2.blend
      description: "Tested this procedural shader pack in Blender 4.3 with the new raytraced micro-displacement. 120fps viewport achieved!",
    },
    likeCount: 620,
    commentCount: 53,
    shareCount: 78,
    bookmarkCount: 145,
    isLiked: false,
    isBookmarked: false,
    tags: ["Blender3D", "Shaders", "CGI"],
  },
];

export const mockSpaces: Space[] = [
  {
    id: "space-motion",
    name: "Motion & Spatial Guild",
    slug: "motion-spatial",
    description:
      "Daily critique, procedural render pipelines, and spatial interface prototyping for digital architects.",
    bannerUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
    verified: true,
    memberCount: 12800,
    onlineCount: 420,
    isJoined: true,
    isBookmarked: true,
    category: "Design & Spatial",
    liveStageActive: true,
    liveStageTitle: "Spatial Haptics & Vision Pro Shader Pipelines",
    liveStageListenersCount: 36,
    channels: [
      { id: "c-feed", spaceId: "space-motion", name: "feed", type: "feed" },
      { id: "c-chat", spaceId: "space-motion", name: "lounge-chat", type: "chat", unreadCount: 5 },
      { id: "c-files", spaceId: "space-motion", name: "asset-vault", type: "files" },
      { id: "c-stage", spaceId: "space-motion", name: "live-audio-stage", type: "stage" },
      { id: "c-events", spaceId: "space-motion", name: "critique-sessions", type: "events" },
    ],
  },
  {
    id: "space-design-systems",
    name: "Design Systems Core",
    slug: "design-systems",
    description: "Multi-platform design token architecture, AST compiler tools, and reactive component engineering.",
    bannerUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop&q=80",
    verified: true,
    memberCount: 8900,
    onlineCount: 310,
    isJoined: true,
    category: "Engineering",
    liveStageActive: false,
  },
  {
    id: "space-sound-lab",
    name: "Sound Design Hub",
    slug: "sound-design",
    description: "Binaural sound synthesis, spatial audio stems, and real-time interactive audio plugins.",
    bannerUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80",
    verified: false,
    memberCount: 4500,
    onlineCount: 142,
    isJoined: false,
    category: "Audio",
    liveStageActive: true,
    liveStageTitle: "Granular Synthesis Jam",
    liveStageListenersCount: 18,
  },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv-elena",
    isGroup: false,
    participants: [mockUsers.elena],
    unreadCount: 2,
    updatedAt: "10:28 AM",
    lastMessage: {
      id: "m-last-1",
      conversationId: "conv-elena",
      sender: mockUsers.elena,
      content: "Voice memo (0:42)",
      createdAt: "10:28 AM",
      readBy: [],
      isVoiceNote: true,
      voiceDuration: "0:42",
    },
  },
  {
    id: "conv-space-core",
    title: "Design Systems Core",
    isGroup: true,
    participants: [mockUsers.alex, mockUsers.emily, mockCurrentUser],
    unreadCount: 0,
    updatedAt: "10:15 AM",
    lastMessage: {
      id: "m-last-2",
      conversationId: "conv-space-core",
      sender: mockCurrentUser,
      content: "Maya: Exported fresh AST token bundle directly to production...",
      createdAt: "10:15 AM",
      readBy: [mockUsers.alex.id, mockUsers.emily.id],
    },
  },
  {
    id: "conv-liam",
    isGroup: false,
    participants: [mockUsers.liam],
    unreadCount: 0,
    updatedAt: "09:41 AM",
    lastMessage: {
      id: "m-last-3",
      conversationId: "conv-liam",
      sender: mockUsers.liam,
      content: "Sent 3D avatar rig preview",
      createdAt: "09:41 AM",
      readBy: [mockCurrentUser.id],
      attachments: [mockFiles[2]],
    },
  },
  {
    id: "conv-marcus",
    isGroup: false,
    participants: [mockUsers.marcus],
    unreadCount: 0,
    updatedAt: "Yesterday",
    lastMessage: {
      id: "m-last-4",
      conversationId: "conv-marcus",
      sender: mockUsers.marcus,
      content: "Are we kicking off the spaces audio stage at 4?",
      createdAt: "Yesterday",
      readBy: [mockCurrentUser.id],
    },
  },
];

export const mockMessages: Record<string, Message[]> = {
  "conv-elena": [
    {
      id: "msg-1",
      conversationId: "conv-elena",
      sender: mockUsers.elena,
      content: "Hey Maya! Loved your latest post on spatial spring curves. The overshoot timing is spot on.",
      createdAt: "10:15 AM",
      readBy: [mockCurrentUser.id],
    },
    {
      id: "msg-2",
      conversationId: "conv-elena",
      sender: mockCurrentUser,
      content: "Thanks Elena! We tuned damping to 0.82 to avoid ocular fatigue on rapid flick gestures.",
      createdAt: "10:20 AM",
      readBy: [mockUsers.elena.id],
    },
    {
      id: "msg-3",
      conversationId: "conv-elena",
      sender: mockUsers.elena,
      content: "I recorded a voice note explaining how the acoustic feedback can sync with the breakaway curve:",
      createdAt: "10:28 AM",
      readBy: [],
      isVoiceNote: true,
      voiceDuration: "0:42",
    },
  ],
};

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "reaction",
    actor: mockUsers.emily,
    message: "liked your spatial file drop Spatial_UX_Architecture.pdf",
    targetPath: "/post/post-2",
    createdAt: "12m ago",
    isRead: false,
    metaBadge: "favorite",
  },
  {
    id: "notif-2",
    type: "space_invite",
    actor: mockUsers.alex,
    message: "invited you to tune into the live stage in Motion & Spatial Guild",
    targetPath: "/spaces/space-motion",
    createdAt: "45m ago",
    isRead: false,
    metaBadge: "mic",
  },
  {
    id: "notif-3",
    type: "file_share",
    actor: mockUsers.liam,
    message: "shared Quantum_Shader_Pack_v2.blend with you in Universal Drive",
    targetPath: "/files/file-quantum-blend",
    createdAt: "2h ago",
    isRead: true,
    metaBadge: "deployed_code",
  },
  {
    id: "notif-4",
    type: "comment",
    actor: mockUsers.marcus,
    message: "commented: 'Can we run a live diff with the previous shader version?'",
    targetPath: "/post/post-1",
    createdAt: "Yesterday",
    isRead: true,
    metaBadge: "chat",
  },
];
