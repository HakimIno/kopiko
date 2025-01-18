"use client";

import { Card } from "@/components/ui/card";
import { Users, FolderKanban, Calendar, Bell } from "lucide-react";
import { Workspace } from "../types";

interface WorkspaceStatsProps {
  workspace: Workspace;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="p-4 border-[#D69D78]/10 hover:border-[#D69D78]/80">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-[#D69D78]/10">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export function WorkspaceStats({ workspace }: WorkspaceStatsProps) {
  const stats = [
    {
      icon: <Users className="w-5 h-5 text-[#D69D78]" />,
      label: "Team Members",
      value: workspace._count?.members || 0
    },
    {
      icon: <FolderKanban className="w-5 h-5 text-[#D69D78]" />,
      label: "Active Projects",
      value: workspace._count?.projects || 0
    },
    {
      icon: <Calendar className="w-5 h-5 text-[#D69D78]" />,
      label: "Tasks Due Today",
      value: 8
    },
    {
      icon: <Bell className="w-5 h-5 text-[#D69D78]" />,
      label: "Notifications",
      value: 3
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
} 