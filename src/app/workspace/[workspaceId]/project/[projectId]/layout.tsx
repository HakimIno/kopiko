import { ReactNode } from 'react';

interface ProjectLayoutProps {
  children: ReactNode;
  params: {
    workspaceId: string;
    projectId: string;
  };
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  return (
    <div className="h-screen flex">
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}