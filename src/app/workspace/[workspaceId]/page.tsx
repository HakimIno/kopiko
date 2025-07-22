import { Suspense } from "react";
import WorkspaceClient from "./workspace-client";

interface WorkspacePageProps {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
    const resolvedParams = await params;
    const workspaceId = resolvedParams.workspaceId;
    
    return (
        <Suspense fallback={<div className="font-anuphan">Loading...</div>}>
            <WorkspaceClient workspaceId={workspaceId} />
        </Suspense>
    );
} 