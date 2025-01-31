'use client';

import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  Calendar,
  GanttChart,
  Table2,
  Grid3x3,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  Folder,
  Users,
  Clock,
  FileText,
  BarChart2,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useProject } from '@/hooks/use-project';
import { useProjectContext } from '../providers/ProjectProvider';
import { CustomViewDialog } from './CustomViewDialog';

const viewGroups = [
  {
    id: 'overview',
    name: 'Overview',
    views: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: LayoutDashboard,
        path: '',
        description: 'Project overview and key metrics',
      },
      {
        id: 'reports',
        name: 'Reports',
        icon: BarChart2,
        path: '/reports',
        description: 'Project analytics and reports',
      },
    ],
  },
  {
    id: 'tasks',
    name: 'Tasks',
    views: [
      {
        id: 'kanban',
        name: 'Kanban Board',
        icon: KanbanSquare,
        path: '/kanban',
        description: 'Drag and drop task management',
      },
      {
        id: 'list',
        name: 'List View',
        icon: ListTodo,
        path: '/list',
        description: 'Detailed list of all tasks',
      },
      {
        id: 'table',
        name: 'Table View',
        icon: Table2,
        path: '/table',
        description: 'Customizable table view',
      },
    ],
  },
  {
    id: 'planning',
    name: 'Planning',
    views: [
      {
        id: 'calendar',
        name: 'Calendar',
        icon: Calendar,
        path: '/calendar',
        description: 'Calendar view of tasks and deadlines',
      },
      {
        id: 'timeline',
        name: 'Timeline',
        icon: GanttChart,
        path: '/timeline',
        description: 'Gantt chart and timeline view',
      },
      {
        id: 'mindmap',
        name: 'Mind Map',
        icon: Network,
        path: '/mindmap',
        description: 'Visual mind map of project',
      },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    views: [
      {
        id: 'members',
        name: 'Members',
        icon: Users,
        path: '/members',
        description: 'Team members and roles',
      },
      {
        id: 'workload',
        name: 'Workload',
        icon: Clock,
        path: '/workload',
        description: 'Team workload and capacity',
      },
    ],
  },
  {
    id: 'docs',
    name: 'Documentation',
    views: [
      {
        id: 'docs',
        name: 'Documents',
        icon: FileText,
        path: '/docs',
        description: 'Project documentation',
      },
      {
        id: 'archive',
        name: 'Archive',
        icon: Archive,
        path: '/archive',
        description: 'Archived items',
      },
    ],
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [favoriteViews, setFavoriteViews] = useState<string[]>([]);
  const [isCustomViewDialogOpen, setIsCustomViewDialogOpen] = useState(false);
  const { state: { customViews } } = useProjectContext();
  const params = useParams();
  const pathname = usePathname();
  const { data: projectData } = useProject(
    params.workspaceId as string,
    params.projectId as string
  );

  const toggleFavorite = (viewId: string) => {
    setFavoriteViews(prev =>
      prev.includes(viewId)
        ? prev.filter(id => id !== viewId)
        : [...prev, viewId]
    );
  };

  const baseUrl = `/workspace/${params.workspaceId}/project/${params.projectId}`;

  const renderViewLink = (view: typeof viewGroups[0]['views'][0], showDescription = false) => (
    <Link
      key={view.id}
      href={`${baseUrl}${view.path}`}
      className={cn(
        'group flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors relative',
        pathname === `${baseUrl}${view.path}` && 'bg-muted/50'
      )}
    >
      <view.icon className="h-4 w-4" />
      {!isCollapsed && (
        <>
          <div className="flex-1">
            <span>{view.name}</span>
            {showDescription && (
              <p className="text-xs text-muted-foreground">{view.description}</p>
            )}
          </div>
          <Star
            className={cn(
              "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
              favoriteViews.includes(view.id) && "opacity-100 text-yellow-400"
            )}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(view.id);
            }}
            fill={favoriteViews.includes(view.id) ? "currentColor" : "none"}
          />
        </>
      )}
    </Link>
  );

  return (
    <>
      <div
        className={cn(
          'h-full bg-muted/10 border-r relative transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border shadow-md"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        <div className="p-4 space-y-4">
          {/* Project Info */}
          {!isCollapsed && (
            <div className="mb-6">
              <h2 className="font-semibold truncate">{projectData?.project?.name}</h2>
              <p className="text-sm text-muted-foreground truncate">
                {projectData?.project?.key}
              </p>
            </div>
          )}

          {/* Favorites Section */}
          {favoriteViews.length > 0 && !isCollapsed && (
            <div>
              <h3 className="text-sm font-medium mb-2">Favorites</h3>
              <nav className="space-y-1">
                {viewGroups.flatMap(group => 
                  group.views.filter(view => favoriteViews.includes(view.id))
                ).map(view => renderViewLink(view))}
              </nav>
            </div>
          )}

          {/* View Groups */}
          {viewGroups.map(group => (
            <div key={group.id}>
              {!isCollapsed && (
                <h3 className="text-sm font-medium mb-2">{group.name}</h3>
              )}
              <nav className="space-y-1">
                {group.views.map(view => renderViewLink(view, !isCollapsed))}
              </nav>
            </div>
          ))}

          {/* Custom Views */}
          {!isCollapsed && customViews.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Custom Views</h3>
              <nav className="space-y-1">
                {customViews.map(view => (
                  <Link
                    key={view.id}
                    href={`${baseUrl}/custom/${view.id}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors',
                      pathname === `${baseUrl}/custom/${view.id}` && 'bg-muted/50'
                    )}
                  >
                    <Folder className="h-4 w-4" />
                    <span>{view.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Add Custom View Button */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setIsCustomViewDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom View
            </Button>
          )}

          {/* Settings */}
          <Link
            href={`${baseUrl}/settings`}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors mt-auto',
              pathname === `${baseUrl}/settings` && 'bg-muted/50'
            )}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>

      <CustomViewDialog
        open={isCustomViewDialogOpen}
        onClose={() => setIsCustomViewDialogOpen(false)}
      />
    </>
  );
} 