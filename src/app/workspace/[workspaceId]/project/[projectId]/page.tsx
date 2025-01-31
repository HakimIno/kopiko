'use client';

import { use } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectHeader from './components/ProjectHeader';
import KanbanView from './components/TaskBoard/KanbanView';
import CalendarView from './components/TaskBoard/CalendarView';
import SprintBoard from './components/SprintManagement/SprintBoard';
import { useProject } from '@/hooks/use-project';
import SprintSkeleton from './components/SprintManagement/SprintSkeleton';
import { useBoardStore } from '@/store/use-board-store';

// Create a client
const queryClient = new QueryClient();

interface ProjectPageProps {
    params: {
        workspaceId: string;
        projectId: string;
    };
}

function ProjectPageContent({ params }: ProjectPageProps) {
    const resolvedParams = use<ProjectPageProps['params']>(params);
    const { currentView, setCurrentView } = useBoardStore();

    const { data, isLoading, error } = useProject(
        resolvedParams.workspaceId,
        resolvedParams.projectId
    );

    if (isLoading || !data) {
        return (
            <>
                <ProjectHeader
                    project={{
                        id: '',
                        name: 'Loading...',
                        icon: '',
                        backgroundColor: '#D69D78',
                        workspace: {
                            //@ts-ignore
                            id: '',
                            name: 'Loading...',
                            ownerId: '',
                        }
                    }}
                    currentView={currentView}
                    onViewChange={setCurrentView}
                />
                <div className="flex-1 min-h-0 h-screen">
                    <SprintSkeleton />
                </div>
            </>
        );
    }

    if (error) {
        return <div>Error loading project</div>;
    }

    return (
        <div className="h-screen ">
            <ProjectHeader
                project={data?.project}
                currentView={currentView}
                onViewChange={setCurrentView}
            />
            <div className="flex-1 min-h-0">
                {currentView === 'kanban' ? (
                    <KanbanView />
                ) : currentView === "sprint" ? (
                    <SprintBoard />
                ) : currentView === "calendar" ? (
                    <CalendarView />
                ) : null}
            </div>
        </div>
    );
}

// Wrap the page with QueryClientProvider
export default function ProjectPage(props: ProjectPageProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ProjectPageContent {...props} />
        </QueryClientProvider>
    );
}