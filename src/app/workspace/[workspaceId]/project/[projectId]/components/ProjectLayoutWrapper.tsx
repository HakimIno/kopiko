'use client';

import { ReactNode } from 'react';
import { ProjectProvider } from '../providers/ProjectProvider';

interface ProjectLayoutWrapperProps {
    children: ReactNode;
    workspaceId: string;
    projectId: string;
}

export function ProjectLayoutWrapper({
    children,
    workspaceId,
    projectId,
}: ProjectLayoutWrapperProps) {
    return (
        <ProjectProvider workspaceId={workspaceId} projectId={projectId}>
            {children}
        </ProjectProvider>
    );
}