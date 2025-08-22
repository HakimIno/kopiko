import { ReactNode } from 'react';
import { ProjectLayoutWrapper } from './components/ProjectLayoutWrapper';

interface ProjectLayoutProps {
  children: ReactNode;
  params: Promise<{
    workspaceId: string;
    projectId: string;
  }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  // Await params before using its properties
  const { workspaceId, projectId } = await params;
  
  // You can fetch any server-side data here if needed
  return (
    <ProjectLayoutWrapper workspaceId={workspaceId} projectId={projectId}>
      <div className="h-screen flex">
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </ProjectLayoutWrapper>
  );
}