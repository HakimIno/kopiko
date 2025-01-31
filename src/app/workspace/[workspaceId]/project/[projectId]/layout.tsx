import { ReactNode } from 'react';
import { ProjectLayoutWrapper } from './components/ProjectLayoutWrapper';

interface ProjectLayoutProps {
  children: ReactNode;
  params: {
    workspaceId: string;
    projectId: string;
  };
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  // You can fetch any server-side data here if needed
  return (
    <ProjectLayoutWrapper workspaceId={params.workspaceId} projectId={params.projectId}>
      <div className="h-screen flex">
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </ProjectLayoutWrapper>
  );
}