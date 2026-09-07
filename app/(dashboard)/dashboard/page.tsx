import { auth } from "@/lib/auth";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import {
  Video,
  FileCheck2,
  Award,
  Clock,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <WelcomeBanner userName={session?.user?.name} />

      {/* 4 Key Metrics / Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Interviews Completed"
          value="14"
          change="+3 this month"
          trend="up"
          description="Total simulated interviews"
          icon={Video}
        />
        <StatsCard
          title="Average ATS Score"
          value="84%"
          change="+8% vs last upload"
          trend="up"
          description="Across 3 resume versions"
          icon={FileCheck2}
        />
        <StatsCard
          title="Technical Rating"
          value="4.6"
          change="Top 10%"
          trend="up"
          description="Based on code and system design"
          icon={Award}
        />
        <StatsCard
          title="Practice Hours"
          value="18.5h"
          change="4-day streak"
          trend="neutral"
          description="Time spent in active sessions"
          icon={Clock}
        />
      </div>

      {/* Quick Actions Grid */}
      <QuickActions />

      {/* Recent Activity Section */}
      <RecentActivity />
    </div>
  );
}
