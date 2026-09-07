"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  FileText,
  User,
  Settings,
  X,
  Sparkles,
} from "lucide-react";

export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mock Interviews", href: "/interview", icon: Video },
  { name: "Resume Analyzer", href: "/resume", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-2 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-600/30">
              AI
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white">
                InterviewAce
              </span>
              <span className="text-[10px] uppercase tracking-widest text-blue-400">
                AI Platform
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-8 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400 group-hover:text-white"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pro Plan Card */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-zinc-900/60 p-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Upgrade to Pro
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
          Get unlimited mock interviews, real-time speech analysis, and hiring manager insights.
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-lg bg-blue-600/80 hover:bg-blue-600 py-1.5 text-xs font-medium text-white transition"
        >
          View Plans
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:flex w-64 flex-col shrink-0 border-r border-zinc-800/80 bg-zinc-950">
        {navContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile drawer panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-zinc-950 border-r border-zinc-800 shadow-2xl transition-transform duration-200 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
