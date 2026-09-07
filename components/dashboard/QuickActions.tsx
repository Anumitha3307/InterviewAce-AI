import Link from "next/link";
import {
  PlayCircle,
  UploadCloud,
  FileSearch,
  LineChart,
  ArrowUpRight,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Start Mock Interview",
      description: "AI-driven technical or behavioral mock session",
      href: "/interview",
      icon: PlayCircle,
      accent: "from-blue-600 to-indigo-600",
      badge: "AI Powered",
    },
    {
      title: "Upload Resume",
      description: "Submit a new PDF or DOCX resume for processing",
      href: "/resume",
      icon: UploadCloud,
      accent: "from-purple-600 to-pink-600",
      badge: "Instant Parse",
    },
    {
      title: "Resume Analysis",
      description: "Detailed ATS score breakdown and keyword match",
      href: "/resume",
      icon: FileSearch,
      accent: "from-cyan-600 to-blue-600",
      badge: "84% Score",
    },
    {
      title: "View Progress",
      description: "Track your performance trends and interview history",
      href: "/profile",
      icon: LineChart,
      accent: "from-emerald-600 to-teal-600",
      badge: "Analytics",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Quick Actions
        </h2>
        <span className="text-xs text-zinc-400">Get started immediately</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/90"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.accent} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300">
                    {action.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 flex items-center text-xs font-medium text-blue-400">
                <span>Launch</span>
                <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
