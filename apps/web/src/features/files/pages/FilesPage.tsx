import { useState } from "react";
import {
  FolderSync,
  LayoutGrid,
  List,
  Search,
  Pause,
  X,
  Sparkles,
  Download,
  Share2,
  Eye,
  Loader2,
  Check,
} from "lucide-react";
import { FilterChip } from "@/components/ui/Chip";
import { FileExtensionBadge } from "@/components/ui/Badge";
import { mockFiles } from "@/mocks/mockData";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";

export function FilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(true);

  const categories = [
    { id: "all", label: "All Assets" },
    { id: "docs", label: "Docs (PDF, DOC)" },
    { id: "3d", label: "3D / CAD" },
    { id: "code", label: "Code & Shaders" },
    { id: "audio", label: "Audio Stems" },
    { id: "archives", label: "Archives" },
  ];

  const filteredFiles = mockFiles.filter((file) => {
    const matchesCategory = categoryFilter === "all" || file.category === categoryFilter;
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.extension.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map((f) => f.id));
    }
  };

  return (
    <div className="w-full max-w-[1480px] mx-auto px-3 sm:px-6 py-4 flex flex-col gap-6">
      {/* 1. Header & View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderSync className="w-6 h-6 text-primary" />
            <h1 className="font-display font-bold text-2xl text-cx-text tracking-tight">
              Universal Drive
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fill/25 text-primary font-display font-semibold text-[11px] border border-primary/30">
              v2.4 Smart
            </span>
          </div>
          <p className="font-body text-xs text-cx-muted mt-0.5">
            End-to-end encrypted storage with native 3D viewport, AST code intelligence &amp; AI companions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-full bg-surface-low border border-hairline/40 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={cn(
                "p-1.5 rounded-full transition-colors",
                viewMode === "grid" ? "bg-surface-highest text-primary" : "text-cx-muted hover:text-cx-text",
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={cn(
                "p-1.5 rounded-full transition-colors",
                viewMode === "list" ? "bg-surface-highest text-primary" : "text-cx-muted hover:text-cx-text",
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Smart Search & Category Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3.5 w-4 h-4 text-cx-subtle pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, 3D assets, code, audio stems, archives…"
            className="w-full h-11 pl-10 pr-4 bg-surface/75 backdrop-blur-xl rounded-full text-cx-text placeholder:text-cx-subtle font-body text-sm border border-hairline/40 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
          {categories.map((cat) => (
            <FilterChip
              key={cat.id}
              active={categoryFilter === cat.id}
              showIndicator={cat.id === "all"}
              onClick={() => setCategoryFilter(cat.id)}
            >
              {cat.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* 3. Active Upload / Processing Card */}
      {isUploading && (
        <div className="relative overflow-hidden rounded-card bg-surface-high/90 p-4 border border-hairline/40 shadow-xl">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-fill/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="relative shrink-0 w-11 h-11 rounded-lg bg-surface-highest flex items-center justify-center text-primary shadow-md">
                <FileExtensionBadge extension=".blend" />
              </div>
              <div className="min-w-0">
                <h4 className="font-display font-semibold text-sm text-cx-text truncate">
                  Quantum_Shader_Pack_v2.blend
                </h4>
                <p className="font-body text-xs text-cx-muted mt-0.5">
                  142 MB • Uploading to Spaces Vault
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toast("Upload paused")}
                title="Pause upload"
                className="p-1 rounded-full text-cx-muted hover:text-cx-text hover:bg-surface-highest transition-colors"
              >
                <Pause className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                title="Cancel upload"
                className="p-1 rounded-full text-cx-muted hover:text-error hover:bg-surface-highest transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Track & Velocity */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-display">
              <span className="text-secondary flex items-center gap-1.5 font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="truncate">Generating 3D viewport &amp; security scan…</span>
              </span>
              <span className="text-cx-text font-bold">68%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-canvas-lowest overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-secondary via-primary-fill to-tertiary-fill rounded-full relative transition-all"
                style={{ width: "68%" }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center justify-between font-body text-xs text-cx-muted pt-0.5">
              <span>Transferred: 96.5 MB</span>
              <span className="text-primary font-display font-semibold">18.4 MB/s</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Intelligent Files Header */}
      <div className="flex items-center justify-between pt-1">
        <span className="font-display font-semibold text-xs text-cx-muted uppercase tracking-wider">
          Intelligent Digital Objects ({filteredFiles.length})
        </span>
        <button
          type="button"
          onClick={selectAll}
          className="font-display font-semibold text-xs text-primary hover:underline"
        >
          {selectedIds.length === filteredFiles.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      {/* 5. Files Grid / List Display */}
      {viewMode === "list" ? (
        <div className="flex flex-col gap-2.5">
          {filteredFiles.map((file) => {
            const isSelected = selectedIds.includes(file.id);
            return (
              <div
                key={file.id}
                className={cn(
                  "p-3.5 rounded-card bg-surface/75 backdrop-blur-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md",
                  isSelected
                    ? "border-primary/60 bg-surface-high"
                    : "border-hairline/30 hover:border-hairline/60 hover:bg-surface-high/60",
                )}
              >
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => toggleSelect(file.id)}
                    aria-label={`Select ${file.name}`}
                    className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0",
                      isSelected
                        ? "bg-primary-fill border-primary-fill text-white shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                        : "border-hairline/60 hover:border-primary",
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="relative shrink-0 w-11 h-11 rounded-lg bg-surface-highest flex items-center justify-center shadow-md">
                    <FileExtensionBadge extension={file.extension} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-sm text-cx-text truncate">
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-cx-muted font-body mt-0.5">
                      <span>{(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                      <span>•</span>
                      <span>{file.version || "v1.0"}</span>
                      <span>•</span>
                      <span className="text-secondary font-medium capitalize">
                        {file.permission}
                      </span>
                    </div>
                  </div>
                </div>

                {/* File Action Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline/20">
                  <button
                    type="button"
                    onClick={() =>
                      toast("AI File Analysis", {
                        description: file.aiSummary || "Examining token structures and AST components.",
                      })
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-high hover:bg-surface-highest text-primary font-display text-xs font-semibold border border-hairline/40 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toast(`Opening preview for ${file.name}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-high hover:bg-surface-highest text-cx-text font-display text-xs font-semibold border border-hairline/40 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success(`Downloading ${file.name}`)}
                    className="p-2 rounded-full hover:bg-surface-highest text-cx-muted hover:text-cx-text transition-colors"
                    aria-label="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast(`Share link copied for ${file.name}`)}
                    className="p-2 rounded-full hover:bg-surface-highest text-cx-muted hover:text-cx-text transition-colors"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const isSelected = selectedIds.includes(file.id);
            return (
              <div
                key={file.id}
                className={cn(
                  "p-4 rounded-card bg-surface/75 backdrop-blur-xl border transition-all flex flex-col justify-between gap-3 shadow-md",
                  isSelected
                    ? "border-primary/60 bg-surface-high"
                    : "border-hairline/30 hover:border-hairline/60 hover:bg-surface-high/60",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="relative shrink-0 w-12 h-12 rounded-lg bg-surface-highest flex items-center justify-center shadow-md">
                    <FileExtensionBadge extension={file.extension} />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSelect(file.id)}
                    aria-label={`Select ${file.name}`}
                    className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-primary-fill border-primary-fill text-white"
                        : "border-hairline/60 hover:border-primary",
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-sm text-cx-text truncate">
                    {file.name}
                  </h3>
                  <p className="font-body text-xs text-cx-muted mt-0.5">
                    {(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB • {file.version || "v1.0"}
                  </p>
                  {file.aiSummary && (
                    <p className="font-body text-xs text-cx-subtle line-clamp-2 mt-2">
                      {file.aiSummary}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-hairline/20">
                  <button
                    type="button"
                    onClick={() =>
                      toast("AI File Analysis", {
                        description: file.aiSummary || "Examining tokens.",
                      })
                    }
                    className="flex items-center gap-1 text-primary font-display text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success(`Downloading ${file.name}`)}
                    className="flex items-center gap-1 text-cx-muted hover:text-cx-text text-xs font-display"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Selected Files Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full bg-surface-high/95 backdrop-blur-2xl border border-primary/50 shadow-[0_8px_32px_rgba(0,0,0,0.75)] flex items-center gap-4 text-xs font-display">
          <span className="text-white font-semibold">
            {selectedIds.length} {selectedIds.length === 1 ? "file" : "files"} selected
          </span>
          <div className="h-4 w-px bg-hairline" />
          <button
            type="button"
            onClick={() => {
              toast.success(`Exporting ${selectedIds.length} assets as .zip bundle.`);
              setSelectedIds([]);
            }}
            className="text-primary hover:underline font-semibold"
          >
            Download Bundle
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-cx-muted hover:text-cx-text"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
