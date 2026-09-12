import { CheckCircle2, ArrowUp } from "lucide-react";

export function FeedCaughtUp() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col items-center justify-center text-center px-4 py-10 my-2 select-none">
      <div className="w-12 h-12 rounded-full bg-surface-high flex items-center justify-center mb-3 text-primary shadow-[0_0_20px_rgba(210,187,255,0.3)]">
        <CheckCircle2 className="w-6 h-6 animate-pulse" />
      </div>
      <h3 className="font-display font-bold text-lg text-cx-text">
        You're all caught up!
      </h3>
      <p className="font-body text-xs text-cx-muted max-w-xs mt-1">
        ✨ Zero missed drops across all your spaces and favorite creators.
      </p>
      <button
        type="button"
        onClick={scrollToTop}
        className="mt-4 py-2 px-5 rounded-full bg-surface-high hover:bg-surface-highest text-primary font-display font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 border border-hairline/40"
      >
        <ArrowUp className="w-3.5 h-3.5" />
        <span>Back to top</span>
      </button>
    </section>
  );
}
