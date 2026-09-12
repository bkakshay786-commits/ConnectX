import type { ReactNode } from "react";
import { Link } from "react-router";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const mediaPreviews = [
    {
      label: "Photos",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
    {
      label: "Videos",
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    },
    {
      label: "3D Assets",
      img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&auto=format&fit=crop&q=80",
    },
    {
      label: "Files",
      img: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=200&auto=format&fit=crop&q=80",
    },
    {
      label: "Communities",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#090A0F] text-[#F5F6FA] flex flex-col items-center justify-between px-3 py-4 sm:px-6 sm:py-8 overflow-x-hidden select-none">
      {/* Cosmic Planet & Nebula Background matching reference screenshot */}
      <div
        className="fixed -top-24 -right-24 w-[480px] sm:w-[620px] h-[480px] sm:h-[620px] rounded-full pointer-events-none -z-10 opacity-70 blur-[90px] will-change-transform"
        style={{
          background: "radial-gradient(circle at center, rgba(56, 139, 255, 0.35) 0%, rgba(124, 92, 255, 0.25) 45%, transparent 75%)",
          contain: "paint",
        }}
        aria-hidden="true"
      />
      <div
        className="fixed top-1/4 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none -z-10 opacity-50 blur-[110px] will-change-transform"
        style={{
          background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 80%)",
          contain: "paint",
        }}
        aria-hidden="true"
      />
      {/* Subtle Starfield Overlay */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px), radial-gradient(rgba(124, 92, 255, 0.7) 1px, transparent 1px)",
          backgroundSize: "64px 64px, 96px 96px",
          backgroundPosition: "0 0, 32px 32px",
          contain: "paint",
        }}
        aria-hidden="true"
      />

      {/* Top Brand Header */}
      <header className="flex flex-col items-center text-center pt-2 sm:pt-6 pb-2">
        <Link to="/" className="flex flex-col items-center group transition-transform hover:scale-105">
          <div className="relative mb-2">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-[#3B82F6] blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <img
              src="/brand/connectx-mark.svg"
              alt="ConnectX Logo"
              width={56}
              height={56}
              fetchPriority="high"
              decoding="async"
              className="relative w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_20px_rgba(124,92,255,0.7)]"
            />
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-white drop-shadow-sm">
            ConnectX
          </h1>
        </Link>
        <p className="font-body text-xs sm:text-sm text-[#9EA5B9] mt-0.5 tracking-wide">
          Share. Create. Connect. Beyond Limits.
        </p>
      </header>

      {/* Main Authentication Card Container */}
      <main className="w-full flex items-center justify-center my-2 sm:my-3 z-10">
        {children}
      </main>

      {/* Bottom Section: Media Previews & Footer */}
      <footer className="w-full max-w-4xl flex flex-col items-center text-center gap-5 pt-4 pb-4">
        {/* Preview Cards */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <p className="font-display text-xs font-semibold text-[#9EA5B9] tracking-wider">
            One Platform. Infinite Possibilities.
          </p>
          <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3.5 max-w-full px-2">
            {mediaPreviews.map((p) => (
              <div
                key={p.label}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl p-0.5 bg-[#171923] border border-[#232736] group-hover:border-[#7C5CFF]/60 transition-all overflow-hidden shadow-lg group-hover:shadow-[0_0_16px_rgba(124,92,255,0.35)] group-hover:scale-105">
                  <img
                    src={p.img}
                    alt={p.label}
                    width={60}
                    height={60}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-[10px] brightness-90 group-hover:brightness-105 transition-all"
                  />
                </div>
                <span className="font-body text-[11px] text-[#9EA5B9] group-hover:text-white transition-colors">
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal & Navigation Links */}
        <div className="flex flex-col items-center gap-2 pt-2 border-t border-[#232736]/60 w-full">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-body text-[#9EA5B9]">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <span>•</span>
            <a href="#help" className="hover:text-white transition-colors">Help</a>
            <span>•</span>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            <span>•</span>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="font-body text-[11px] text-[#5B6275]">
            © 2026 ConnectX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
