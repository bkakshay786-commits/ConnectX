import { useState } from "react";
import { useSearchParams, NavLink } from "react-router";
import { Search, Users, FolderSync, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { FileExtensionBadge } from "@/components/ui/Badge";
import { mockUsers, mockSpaces, mockFiles, mockPosts } from "@/mocks/mockData";
import { FilterChip } from "@/components/ui/Chip";
import { appRoutes } from "@/app/config/routes";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const matchingPeople = Object.values(mockUsers).filter(
    (u) =>
      !query ||
      u.displayName.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase()),
  );

  const matchingSpaces = mockSpaces.filter(
    (s) => !query || s.name.toLowerCase().includes(query.toLowerCase()),
  );

  const matchingFiles = mockFiles.filter(
    (f) => !query || f.name.toLowerCase().includes(query.toLowerCase()),
  );

  const matchingPosts = mockPosts.filter((p) => {
    if (!query) return true;
    if (p.content.kind === "text" && p.content.text.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    if (p.content.kind === "file" && p.content.file.name.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    return false;
  });

  return (
    <div className="w-full max-w-[1100px] mx-auto px-3 sm:px-6 py-4 flex flex-col gap-6">
      {/* Search Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-cx-text">Universal Search</h1>
        <p className="font-body text-xs text-cx-muted mt-0.5">
          Federated search across social profiles, spaces, digital vault files, and posts.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative flex items-center w-full">
        <Search className="absolute left-4 w-5 h-5 text-cx-subtle pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keywords, tags, or file extensions…"
          className="w-full h-12 pl-12 pr-4 bg-surface/80 backdrop-blur-xl rounded-full text-cx-text placeholder:text-cx-subtle font-body text-sm border border-hairline/40 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
        />
      </form>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: "All Results" },
          { id: "people", label: `People (${matchingPeople.length})` },
          { id: "spaces", label: `Spaces (${matchingSpaces.length})` },
          { id: "files", label: `Files (${matchingFiles.length})` },
          { id: "posts", label: `Posts (${matchingPosts.length})` },
        ].map((tab) => (
          <FilterChip
            key={tab.id}
            active={category === tab.id}
            onClick={() => setCategory(tab.id)}
          >
            {tab.label}
          </FilterChip>
        ))}
      </div>

      {/* Results Sections */}
      <div className="flex flex-col gap-8">
        {/* People Results */}
        {(category === "all" || category === "people") && matchingPeople.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="font-display font-bold text-sm text-cx-muted uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>People &amp; Creators</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {matchingPeople.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-card bg-surface/70 border border-hairline/30 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar src={u.avatarUrl} alt={u.displayName} size="sm" presence={u.presence} />
                    <div className="min-w-0">
                      <h4 className="font-display font-semibold text-xs text-cx-text truncate">
                        {u.displayName}
                      </h4>
                      <p className="text-[11px] font-body text-cx-muted truncate">@{u.username}</p>
                    </div>
                  </div>
                  <NavLink
                    to={appRoutes.profile}
                    className="px-3 py-1 rounded-full bg-surface-highest hover:bg-surface text-cx-text font-display text-xs font-semibold border border-hairline/40 shrink-0"
                  >
                    View
                  </NavLink>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Spaces Results */}
        {(category === "all" || category === "spaces") && matchingSpaces.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="font-display font-bold text-sm text-cx-muted uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <span>Spaces &amp; Guilds</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchingSpaces.map((sp) => (
                <div
                  key={sp.id}
                  className="p-4 rounded-card bg-surface/70 border border-hairline/30 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="font-display font-semibold text-sm text-cx-text truncate">
                      {sp.name}
                    </h4>
                    <p className="font-body text-xs text-cx-muted truncate mt-0.5">
                      {sp.description}
                    </p>
                  </div>
                  <NavLink
                    to={appRoutes.spaces}
                    className="px-4 py-1.5 rounded-full bg-primary-fill text-white font-display text-xs font-semibold shrink-0 shadow-sm"
                  >
                    Enter
                  </NavLink>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Files Results */}
        {(category === "all" || category === "files") && matchingFiles.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="font-display font-bold text-sm text-cx-muted uppercase tracking-wider flex items-center gap-2">
              <FolderSync className="w-4 h-4 text-primary" />
              <span>Vault Objects &amp; Files</span>
            </h3>
            <div className="flex flex-col gap-2">
              {matchingFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-xl bg-surface/70 border border-hairline/30 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileExtensionBadge extension={file.extension} />
                    <div className="min-w-0">
                      <h4 className="font-display font-semibold text-xs text-cx-text truncate">
                        {file.name}
                      </h4>
                      <p className="font-body text-[11px] text-cx-muted">
                        {(file.sizeBytes / 1024 / 1024).toFixed(1)} MB • {file.permission}
                      </p>
                    </div>
                  </div>
                  <NavLink
                    to={appRoutes.files}
                    className="flex items-center gap-1 text-primary hover:underline text-xs font-display font-semibold"
                  >
                    <span>View in Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </NavLink>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
