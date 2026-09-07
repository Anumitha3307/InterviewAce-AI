import Link from "next/link";
import {
  Video,
  FileText,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export type ActivityItem = {
  id: string;
  type: "interview" | "resume" | "practice" | "milestone";
  title: string;
  description: string;
  date: string;
  score?: string;
  status: "completed" | "in-progress" | "reviewed";
};

const placeholderActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "interview",
    title: "System Design Mock Interview",
    description: "Distributed Cache & Microservices Architecture with AI Interviewer",
    date: "2 hours ago",
    score: "88%",
    status: "completed",
  },
  {
    id: "act-2",
    type: "resume",
    title: "Full-Stack Resume Analyzed",
    description: "Evaluated for Senior Frontend / Full-Stack Engineer positions",
    date: "Yesterday",
    score: "84/100",
    status: "reviewed",
  },
  {
    id: "act-3",
    type: "practice",
    title: "Algorithms: Dynamic Programming",
    description: "Completed 5 practice questions on dynamic programming patterns",
    date: "3 days ago",
    score: "5/5",
    status: "completed",
  },
  {
    id: "act-4",
    type: "milestone",
    title: "Behavioral Communication Milestone",
    description: "Achieved 'Advanced' rating in STAR-method clarity and pacing",
    date: "5 days ago",
    score: "Level 4",
    status: "completed",
  },
];

export function RecentActivity() {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "interview":
        return <Video className="h-4 w-4 text-blue-400" />;
      case "resume":
        return <FileText className="h-4 w-4 text-purple-400" />;
      case "practice":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "milestone":
        return <TrendingUp className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Recent Activity
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Your latest sessions and performance milestones
          </p>
        </div>
        <Link
          href="/profile"
          className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-zinc-800/60">
        {placeholderActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-zinc-800/20 px-2 rounded-xl"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-800/80">
                {getIcon(activity.type)}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-white">
                  {activity.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 pt-0.5 text-[11px] text-zinc-500">
                  <Clock className="h-3 w-3" />
                  <span>{activity.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0">
              {activity.score && (
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                  {activity.score}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-zinc-600 hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
