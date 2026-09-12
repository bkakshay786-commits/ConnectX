import { useState } from "react";
import {
  Compass,
  Radio,
  Users,
  Box,
  Image,
  FolderSync,
  Code2,
  Sparkles,
  Heart,
  ExternalLink,
  Search,
} from "lucide-react";
import { FilterChip } from "@/components/ui/Chip";
import { mockSpaces, mockUsers } from "@/mocks/mockData";
import { Avatar } from "@/components/ui/Avatar";
import { FileExtensionBadge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";
import { NavLink } from "react-router";
import { appRoutes } from "@/app/config/routes";

export function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const filters = [
    { id: "all", label: "All Sparks", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "spaces", label: "Spaces", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "3d", label: "3D / CAD", icon: <Box className="w-3.5 h-3.5" /> },
    { id: "media", label: "Media & Art", icon: <Image className="w-3.5 h-3.5" /> },
    { id: "files", label: "Files & Kits", icon: <FolderSync className="w-3.5 h-3.5" /> },
    { id: "code", label: "Code & Shaders", icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  const featuredSpace = mockSpaces[0];

  return (
    <div className="w-full max-w-[1480px] mx-auto px-3 sm:px-6 py-4 flex flex-col gap-6">
      {/* 1. Explore Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            <h1 className="font-display font-bold text-2xl text-cx-text tracking-tight">
              Curated Universe
            </h1>
          </div>
          <p className="font-body text-xs text-cx-muted mt-0.5">
            Discover spatial experiments, audio stems, generative code, and community guilds.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-cx-subtle pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter explore…"
            className="w-full h-10 pl-10 pr-4 bg-surface-high/80 rounded-full font-body text-xs text-cx-text placeholder:text-cx-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-highest transition-all"
          />
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {filters.map((f) => (
          <FilterChip
            key={f.id}
            active={activeFilter === f.id}
            icon={f.icon}
            showIndicator={f.id === "all"}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </FilterChip>
        ))}
      </div>

      {/* 3. Spotlight Hero: Featured Space */}
      <div className="relative overflow-hidden rounded-card bg-surface-low border border-hairline/40 shadow-2xl p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-fill/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-secondary-fill/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary-fill via-secondary to-tertiary-fill flex items-center justify-center text-white shrink-0 shadow-[0_0_24px_rgba(124,58,237,0.5)]">
              <Box className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-primary-fill/20 text-primary font-display font-semibold text-[10px] uppercase tracking-wider border border-primary/30">
                  Spotlight Guild
                </span>
                <span className="flex items-center gap-1 text-tertiary text-xs font-display font-semibold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Live Audio On-Air
                </span>
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-cx-text">
                {featuredSpace.name}
              </h2>
              <p className="font-body text-xs sm:text-sm text-cx-muted line-clamp-2 max-w-xl">
                {featuredSpace.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <NavLink
              to={appRoutes.spaces}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-primary-fill hover:bg-primary-fill/90 text-white font-display text-xs font-semibold text-center shadow-[0_0_16px_rgba(124,58,237,0.45)] hover:scale-105 active:scale-95 transition-all"
            >
              Enter Space
            </NavLink>
            <button
              type="button"
              onClick={() => toast("Connected to Live Audio Stage!")}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-surface-highest hover:bg-surface text-cx-text font-display text-xs font-semibold flex items-center justify-center gap-1.5 border border-hairline/40 active:scale-95 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-tertiary" />
              <span>Listen (36)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Curated Discovery Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bento Card 1: 3D Procedural Shader Pack */}
        <div className="bg-surface/75 backdrop-blur-xl rounded-card p-5 border border-hairline/30 shadow-xl flex flex-col justify-between gap-4 group hover:border-primary/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar src={mockUsers.liam.avatarUrl} alt={mockUsers.liam.displayName} size="sm" />
              <div>
                <h4 className="font-display font-semibold text-xs text-cx-text">Liam Gallagher</h4>
                <p className="text-[10px] text-cx-muted font-body">Procedural 3D Artist</p>
              </div>
            </div>
            <FileExtensionBadge extension=".blend" />
          </div>

          <div className="relative rounded-xl overflow-hidden bg-surface-lowest h-44 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80"
              alt="Shader preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-display">
              <span className="font-semibold">Quantum Shaders v2</span>
              <span className="text-secondary font-mono">142 MB</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-cx-muted">
            <span className="flex items-center gap-1 text-tertiary font-display">
              <Heart className="w-3.5 h-3.5 fill-tertiary" /> 620
            </span>
            <button
              type="button"
              onClick={() => toast("Inspecting 3D Shader in Viewer")}
              className="flex items-center gap-1 text-primary hover:underline font-display text-xs font-semibold"
            >
              <span>Inspect 3D</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Card 2: Spatial Interaction Kit */}
        <div className="bg-surface/75 backdrop-blur-xl rounded-card p-5 border border-hairline/30 shadow-xl flex flex-col justify-between gap-4 group hover:border-primary/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar src={mockUsers.emily.avatarUrl} alt={mockUsers.emily.displayName} size="sm" />
              <div>
                <h4 className="font-display font-semibold text-xs text-cx-text">Emily Chen</h4>
                <p className="text-[10px] text-cx-muted font-body">Spatial Architect</p>
              </div>
            </div>
            <FileExtensionBadge extension=".fig" />
          </div>

          <div className="relative rounded-xl overflow-hidden bg-surface-lowest h-44 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
              alt="Figma UI Kit preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-display">
              <span className="font-semibold">Spatial_Interaction_Kit</span>
              <span className="text-secondary font-mono">84.2 MB</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-cx-muted">
            <span className="flex items-center gap-1 text-tertiary font-display">
              <Heart className="w-3.5 h-3.5 fill-tertiary" /> 1,420
            </span>
            <button
              type="button"
              onClick={() => toast("Duplicate kit initiated")}
              className="flex items-center gap-1 text-primary hover:underline font-display text-xs font-semibold"
            >
              <span>Duplicate</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Card 3: Live Community Spotlight */}
        <div className="bg-surface/75 backdrop-blur-xl rounded-card p-5 border border-hairline/30 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h4 className="font-display font-bold text-sm text-cx-text">Featured Spaces</h4>
          </div>

          <div className="flex flex-col gap-3">
            {mockSpaces.slice(1).map((sp) => (
              <div
                key={sp.id}
                className="p-3 rounded-xl bg-surface-high/60 border border-hairline/30 flex items-center justify-between gap-3 hover:bg-surface-high transition-colors"
              >
                <div className="min-w-0">
                  <h5 className="font-display font-semibold text-xs text-cx-text truncate">
                    {sp.name}
                  </h5>
                  <p className="font-body text-[11px] text-cx-muted truncate">
                    {sp.memberCount.toLocaleString()} members
                  </p>
                </div>
                <NavLink
                  to={appRoutes.spaces}
                  className="px-3 py-1 rounded-full bg-surface-highest hover:bg-primary-fill hover:text-white text-cx-text font-display text-xs font-semibold transition-all border border-hairline/40 shrink-0"
                >
                  Join
                </NavLink>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-r from-primary-fill/15 to-secondary-fill/15 border border-primary/25 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-xs text-cx-text">
                Create Your Own Space
              </span>
            </div>
            <NavLink
              to={appRoutes.create}
              className="text-xs font-display font-bold text-primary hover:underline"
            >
              Start Guild →
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
