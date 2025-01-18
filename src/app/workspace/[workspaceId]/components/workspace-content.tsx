"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderKanban, Plus, Users2, Clock, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";
import { EditProjectDialog } from "./edit-project-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'ON_HOLD';
  key: string;
  isPublic: boolean;
  icon?: string;
  backgroundColor?: string;
  workspaceId?: string;
}

interface WorkspaceContentProps {
  projects: Project[] | undefined;
  onCreateProject: () => void;
  onUpdateProject: (projectId: string, data: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
  isLoading: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: FolderKanban },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'Tasks', icon: Clock },
  { id: 'members', label: 'Members', icon: Users2 },
  { id: 'settings', label: 'Settings', icon: Settings2 }
];

export function WorkspaceContent({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  isLoading
}: WorkspaceContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const projectsList = projects || [];

  // Filter projects based on search and status
  const filteredProjects = projectsList.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const recentProjects = projectsList.slice(0, 3);
  const projectsByStatus = {
    ACTIVE: projectsList.filter(project => project.status === 'ACTIVE').length,
    COMPLETED: projectsList.filter(project => project.status === 'COMPLETED').length,
    ON_HOLD: projectsList.filter(project => project.status === 'ON_HOLD').length,
    ARCHIVED: projectsList.filter(project => project.status === 'ARCHIVED').length,
  };

  const handleProjectEdit = (project: Project) => {
    setEditingProject(project);
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={cn(
                    "flex items-center gap-2 transition-all",
                    activeTab === tab.id && "bg-[#D69D78] text-white hover:bg-[#D69D78]/90"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
          {activeTab === "projects" && (
            <Button
              onClick={onCreateProject}
              disabled={isLoading.create}
              className="bg-[#D69D78] hover:bg-[#D69D78]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </Card>

      {/* Content based on active tab */}
      {activeTab === "overview" ? (
        <OverviewContent
          projectsByStatus={projectsByStatus}
          recentProjects={recentProjects}
          onEdit={handleProjectEdit}
          onDelete={onDeleteProject}
          isLoading={isLoading}
          setActiveTab={setActiveTab}
        />
      ) : activeTab === "projects" ? (
        <ProjectsContent
          filteredProjects={filteredProjects}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onEdit={handleProjectEdit}
          onDelete={onDeleteProject}
          isLoading={isLoading}
        />
      ) : null}

      {/* Edit Project Dialog */}
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          onUpdate={onUpdateProject}
          isLoading={isLoading.update}
        />
      )}
    </div>
  );
}

interface OverviewContentProps {
  projectsByStatus: Record<string, number>;
  recentProjects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  isLoading: {
    update: boolean;
    delete: boolean;
  };
  setActiveTab: (tab: string) => void;
}

function OverviewContent({
  projectsByStatus,
  recentProjects,
  onEdit,
  onDelete,
  isLoading,
  setActiveTab
}: OverviewContentProps) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Project Stats */}
      <Card className="col-span-4 p-6">
        <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(projectsByStatus).map(([status, count]) => (
            <Card key={status} className="p-4 bg-[#D69D78]/5">
              <h4 className="text-sm text-muted-foreground">{status}</h4>
              <p className="text-2xl font-semibold">{count}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Recent Projects */}
      <div className="col-span-3 space-y-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Projects</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("projects")}
            >
              View All
            </Button>
          </div>
          <div className="grid gap-4">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={onEdit}
                onDelete={onDelete}
                isLoading={isLoading}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
}

function ActivityFeed() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {[1, 2, 3].map((activity) => (
          <div key={activity} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D69D78]/10 flex items-center justify-center text-[#D69D78]">
              U
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">User {activity}</span> updated a project
              </p>
              <p className="text-xs text-muted-foreground">2h ago</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface ProjectsContentProps {
  filteredProjects: Project[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  isLoading: {
    update: boolean;
    delete: boolean;
  };
}

function ProjectsContent({
  filteredProjects,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onEdit,
  onDelete,
  isLoading
}: ProjectsContentProps) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <EmptyProjectsState searchQuery={searchQuery} statusFilter={statusFilter} />
      )}
    </div>
  );
}

interface EmptyProjectsStateProps {
  searchQuery: string;
  statusFilter: string;
}

function EmptyProjectsState({ searchQuery, statusFilter }: EmptyProjectsStateProps) {
  return (
    <Card className="p-12 text-center">
      <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No projects found</h3>
      <p className="text-muted-foreground">
        {searchQuery || statusFilter !== "ALL"
          ? "Try adjusting your filters"
          : "Create your first project to get started"}
      </p>
    </Card>
  );
}