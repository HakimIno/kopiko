"use client"

import { CreateWorkspaceButton } from "@/components/workspace/create-workspace-button";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchWithAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Grid3X3, List, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  theme?: {
    color: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    projects: number;
    members: number;
  };
}

interface WorkspaceGroup {
  name: string;
  icon: React.ReactNode;
  description: string;
  workspaces: Workspace[];
  isExpanded: boolean;
}

function WorkspaceCardSkeleton() {
  return (
    <div className="h-48 relative overflow-hidden rounded-lg border">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted" />
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="mt-auto flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      // Get current user ID
      const meResponse = await fetchWithAuth("/api/auth/me");
      if (!meResponse.ok) {
        throw new Error("Failed to get user info");
      }
      const { currentUserId } = await meResponse.json();

      // Fetch workspaces
      const response = await fetchWithAuth("/api/workspaces");
      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }
      const data = await response.json();

      // Group workspaces
      const recent = data.slice(0, 3);
      const team = data.filter((w: Workspace) => w.owner.id !== currentUserId);

      return [
        {
          name: "Recent",
          icon: <Clock className="w-5 h-5" />,
          description: "Recently accessed workspaces",
          workspaces: recent,
          isExpanded: true
        },
        {
          name: "Team",
          icon: <Users className="w-5 h-5" />,
          description: "Workspaces shared with you",
          workspaces: team,
          isExpanded: true
        },
      ] as WorkspaceGroup[];
    },
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
    staleTime: 0, // เปลี่ยนเป็น 0 เพื่อให้ fetch ข้อมูลใหม่ทุกครั้ง
    refetchOnMount: true, // เพิ่มการ refetch เมื่อ component mount
    refetchOnWindowFocus: true, // เพิ่มการ refetch เมื่อ focus กลับมาที่ window
  });
}

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: workspaceGroups = [], isLoading } = useWorkspaces();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Recent: true,
    Team: true
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className="container p-3">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Workspaces</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center  rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-3 py-2 rounded-md ",
                viewMode === 'grid'
                  ? "bg-[#D69D78] shadow-sm scale-105 translate-y-0 text-white"
                  : " scale-100 translate-y-0"
              )}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3
                className={cn(
                  "w-4 h-4 transition-transform duration-300 ",
                  viewMode === 'grid' && "rotate-180"
                )}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-3 py-2 rounded-md ",
                viewMode === 'list'
                  ? "bg-[#D69D78] shadow-sm scale-105 translate-y-0 text-white"
                  : " scale-100 translate-y-0"
              )}
              onClick={() => setViewMode('list')}
            >
              <List
                className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  viewMode === 'list' && "rotate-180"
                )}
              />
            </Button>
          </div>
          <CreateWorkspaceButton />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <WorkspaceCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {workspaceGroups.map((group) => (
            <div key={group.name} className="space-y-4">
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-transparent w-full justify-start"
                onClick={() => toggleGroup(group.name)}
              >
                <motion.div
                  animate={{ rotate: expandedGroups[group.name] ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
                <div className="flex items-center gap-2">
                  {group.icon}
                  <span className="font-semibold text-lg">{group.name}</span>
                  <span className="text-muted-foreground text-sm">
                    ({group.workspaces.length})
                  </span>
                </div>
                <span className="text-muted-foreground text-sm ml-2">
                  — {group.description}
                </span>
              </Button>

              <AnimatePresence>
                {expandedGroups[group.name] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        : "space-y-4"
                    )}
                  >
                    {group.workspaces.map((workspace) => (
                      <motion.div
                        key={workspace.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <WorkspaceCard
                          workspace={workspace}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    ))}
                    {group.name === "Recent" && group.workspaces.length === 0 && (
                      <div className={cn(
                        "border-2 border-dashed rounded-lg flex items-center justify-center",
                        viewMode === 'grid' ? "col-span-full h-48" : "h-24"
                      )}>
                        <CreateWorkspaceButton />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
