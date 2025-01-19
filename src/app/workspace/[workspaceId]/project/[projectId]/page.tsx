'use client';

import { use, useState } from 'react';
import ProjectHeader from './components/ProjectHeader';
import KanbanView from './components/TaskBoard/KanbanView';
import ListView from './components/TaskBoard/ListView';
import CalendarView from './components/TaskBoard/CalendarView';

interface ProjectPageProps {
    params: {
        workspaceId: string;
        projectId: string;
    };
}

export default function ProjectPage({ params }: ProjectPageProps) {
    const resolvedParams = use<ProjectPageProps['params']>(params as any);
    const [currentView, setCurrentView] = useState<'table' | 'kanban' | 'calendar'>('table');

    return (
        <div className="h-full flex flex-col">
            <ProjectHeader
                workspaceId={resolvedParams.workspaceId}
                projectId={resolvedParams.projectId}
                currentView={currentView}
                onViewChange={setCurrentView}
            />
            <div className="flex-1 overflow-auto">
                {currentView === 'kanban' ? (
                    <KanbanView />
                ) : currentView === "table" ? <ListView /> : <CalendarView />}
            </div>
        </div>
    );
}