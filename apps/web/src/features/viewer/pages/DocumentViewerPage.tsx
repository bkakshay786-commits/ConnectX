import { useState } from "react";
import { NavLink, useParams } from "react-router";
import {
  ArrowLeft,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  Download,
  Sparkles,
  ShieldCheck,
  Send,
} from "lucide-react";
import { appRoutes } from "@/app/config/routes";
import { mockFiles } from "@/mocks/mockData";
import { toast } from "@/components/ui/Toaster";

export function DocumentViewerPage() {
  const { fileId } = useParams();
  const [page, setPage] = useState(4);
  const [zoom, setZoom] = useState(100);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChat, setAiChat] = useState<Array<{ role: "ai" | "user"; text: string }>>([
    {
      role: "ai",
      text: "Hello Maya! I've analyzed Spatial_UX_Architecture.pdf. This deliverable covers parametric spring mechanics, gesture breakaway curves, and 120Hz frame pacing rules for spatial OS environments.",
    },
  ]);

  const file = mockFiles.find((f) => f.id === fileId) || mockFiles[1]; // Spatial_UX_Architecture.pdf

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const query = aiPrompt.trim();
    setAiChat((prev) => [
      ...prev,
      { role: "user", text: query },
      {
        role: "ai",
        text: `Based on Section 04, the recommended critical damping ratio is 0.82 with an overshoot peak of 1.08x at T1=140ms. This prevents visual tearing during rapid flick interactions.`,
      },
    ]);
    setAiPrompt("");
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col bg-canvas text-cx-text -mt-4">
      {/* 1. Document Viewer Sticky Toolbar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between px-4 sm:px-6 py-2.5 bg-canvas-lowest/90 backdrop-blur-xl border-b border-hairline/30 gap-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <NavLink
            to={appRoutes.files}
            className="flex items-center gap-1.5 text-cx-muted hover:text-cx-text font-display text-xs py-1.5 px-3 rounded-full hover:bg-surface-high transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Drive</span>
          </NavLink>
          <div className="h-4 w-px bg-hairline/40 hidden sm:block" />
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-tertiary-fill/20 text-tertiary flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-xs text-cx-text truncate">
                  {file.name}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-surface-high text-primary font-display text-[10px] font-bold">
                  {file.version || "v3.0"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-cx-muted font-body">
                <span>{(file.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                <span>•</span>
                <span className="text-primary flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  E2E Scanned &amp; Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Controls */}
        <div className="flex items-center gap-1 bg-surface-low px-2 py-1 rounded-full border border-hairline/40 text-xs">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display px-1.5">
            Slide <span className="text-primary font-bold">{page}</span> of 36
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(36, p + 1))}
            className="p-1 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="h-3 w-px bg-hairline/40 mx-1" />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            className="p-1 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] px-1">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            className="p-1 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast("Present mode activated")}
            className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text font-display text-xs font-semibold"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Present</span>
          </button>
          <button
            type="button"
            onClick={() => toast("Share link copied")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-high hover:bg-surface-highest text-cx-text font-display text-xs font-semibold border border-hairline/40"
          >
            <Share2 className="w-3.5 h-3.5 text-secondary" />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={() => toast.success(`Downloading ${file.name}`)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-high hover:bg-surface-highest text-cx-text font-display text-xs font-semibold border border-hairline/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Raw</span>
          </button>
        </div>
      </div>

      {/* 2. Main 12-Column Stage */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 sm:p-6 flex-1 min-h-[calc(100vh-8rem)]">
        {/* Document Canvas Stage (8 cols) */}
        <section className="xl:col-span-8 flex flex-col justify-between rounded-card bg-surface-lowest p-6 border border-hairline/40 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary-fill/10 blur-3xl pointer-events-none" />

          {/* Slide Header */}
          <div className="flex items-center justify-between pb-4 border-b border-hairline/20">
            <span className="font-display font-semibold text-xs text-cx-muted uppercase tracking-widest">
              Design System Deliverable • Section 04
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fill/20 text-primary font-display font-semibold text-xs">
              Live Gesture Engine V3
            </span>
          </div>

          {/* Slide Content */}
          <div className="flex-1 flex flex-col justify-center my-6 bg-surface-low rounded-xl p-6 border border-hairline/30 shadow-inner">
            <div className="mb-4">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-cx-text">
                Spatial UI Design Tokens &amp; Gesture Curves
              </h2>
              <p className="font-body text-xs sm:text-sm text-cx-muted mt-1">
                Parametric spring mechanics for spatial hand anchors and context sheets.
              </p>
            </div>

            {/* SVG Interactive Spring Curve (from prototype) */}
            <div className="relative h-48 w-full bg-canvas-lowest rounded-xl p-3 flex items-center justify-center overflow-hidden border border-hairline/40">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 140">
                <defs>
                  <linearGradient id="curveGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#adc6ff" />
                    <stop offset="60%" stopColor="#d2bbff" />
                    <stop offset="100%" stopColor="#bf2076" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 120 C 60 120, 90 20, 160 20 C 220 20, 240 70, 310 70 C 350 70, 370 70, 390 70"
                  fill="none"
                  stroke="url(#curveGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="160" cy="20" r="5" fill="#eaddff" className="animate-pulse" />
                <circle cx="310" cy="70" r="4" fill="#ffb0cd" />
                <line
                  x1="160"
                  x2="160"
                  y1="20"
                  y2="130"
                  stroke="#4a4455"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text x="165" y="115" fill="#ccc3d8" fontSize="10" fontFamily="Plus Jakarta Sans">
                  Peak Overshoot (1.08x)
                </text>
              </svg>
            </div>

            <div className="flex items-center justify-between pt-3 text-[11px] font-display text-cx-muted">
              <span>T0 (Rest: 0ms)</span>
              <span>T1 (Breakaway: 140ms)</span>
              <span>T2 (Settle: 320ms)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-display text-cx-subtle pt-2 border-t border-hairline/20">
            <span>ConnectX Universal Spatial Spec</span>
            <span>Slide {page} of 36</span>
          </div>
        </section>

        {/* Ask AI Companion Panel (4 cols) */}
        <section className="xl:col-span-4 flex flex-col rounded-card bg-surface/80 backdrop-blur-2xl p-5 border border-hairline/40 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-hairline/25">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary-fill/20 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-display font-bold text-sm text-cx-text">AI Companion</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fill/20 text-secondary font-display font-semibold text-[10px]">
              Document Context
            </span>
          </div>

          {/* AI Chat History */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[460px] no-scrollbar">
            {aiChat.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === "user"
                    ? "ml-auto max-w-[85%] p-3 rounded-2xl bg-primary-fill text-white text-xs font-body leading-relaxed"
                    : "mr-auto max-w-[95%] p-3 rounded-2xl bg-surface-high/80 text-cx-text border border-hairline/30 text-xs font-body leading-relaxed"
                }
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 py-2 border-t border-hairline/20">
            {[
              "Summarize damping curve",
              "Extract token definitions",
              "Check contrast ratio",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setAiPrompt(chip)}
                className="px-2.5 py-1 rounded-full bg-surface-high hover:bg-surface-highest text-cx-muted hover:text-cx-text text-[11px] font-display transition-colors border border-hairline/30"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Prompt Input */}
          <form onSubmit={handleAskAI} className="relative flex items-center pt-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask anything about this document…"
              className="w-full h-10 pl-3 pr-10 bg-surface-high rounded-full text-xs text-cx-text placeholder:text-cx-subtle font-body focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              aria-label="Send AI prompt"
              className="absolute right-1.5 w-7 h-7 rounded-full bg-primary-fill text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
