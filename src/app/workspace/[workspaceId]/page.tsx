import { Suspense } from "react";
import WorkspaceClient from "./workspace-client";
import ErrorBoundary from "@/components/error-boundary";

interface WorkspacePageProps {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
    const resolvedParams = await params;
    const workspaceId = resolvedParams.workspaceId;
    
    return (
        <ErrorBoundary>
            <Suspense fallback={<div className="font-anuphan">Loading...</div>}>
                <WorkspaceClient workspaceId={workspaceId} />
            </Suspense>
        </ErrorBoundary>
    );
} 