import type { ReactNode } from "react";
import { NavRail } from "@/components/layout/NavRail";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CreateStudioModal } from "@/features/create/components/CreateStudioModal";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen w-full bg-canvas text-cx-text bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.12),rgba(17,19,26,0))] selection:bg-primary-fill selection:text-white">
      {/* Subtle Ambient Glow Orbs */}
      <div
        className="fixed top-0 left-1/4 w-96 h-96 bg-primary-fill/8 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed top-96 right-10 w-96 h-96 bg-secondary-fill/8 rounded-full blur-[160px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Desktop Navigation Rail */}
      <NavRail />

      {/* Main Topbar */}
      <Topbar />

      {/* Page Content Layout */}
      <div className="lg:pl-20 xl:pl-60 pt-16 pb-24 lg:pb-8 min-h-screen transition-all duration-300">
        <main className="w-full h-full relative" id="main-content">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Universal Create Studio Modal */}
      <CreateStudioModal />
    </div>
  );
}
