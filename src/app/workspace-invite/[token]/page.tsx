import { Suspense } from "react";
import WorkspaceInviteClient from "./workspace-invite-client";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function WorkspaceInvitePage({ params }: PageProps) {
  const { token } = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkspaceInviteClient token={token} />
    </Suspense>
  );
} 