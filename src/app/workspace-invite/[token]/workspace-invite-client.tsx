"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WorkspaceInviteClientProps {
    token: string;
}

export default function WorkspaceInviteClient({ token }: WorkspaceInviteClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [workspace, setWorkspace] = useState<{ id: string; name: string }>();
    const router = useRouter();

    // Fetch invitation details when component mounts
    useEffect(() => {
        async function fetchInvitation() {
            try {
                setIsLoading(true);
                const response = await fetchWithAuth(`/api/workspace-invites/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load invitation");
                }

                setWorkspace(data.workspace);
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : "Invalid or expired invitation";
                toast.error(errorMessage);
                router.push("/");
            } finally {
                setIsLoading(false);
            }
        }

        fetchInvitation();
    }, [token, router]);

    async function handleAcceptInvitation() {
        try {
            setIsAccepting(true);
            const response = await fetchWithAuth(`/api/workspace-invites/${token}`, {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to accept invitation");
            }

            toast.success("Invitation accepted successfully!");
            router.push(`/workspace/${data.workspace.id}`);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Something went wrong";
            toast.error(errorMessage);
            router.push("/");
        } finally {
            setIsAccepting(false);
        }
    }

    function handleDecline() {
        router.push("/");
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <Card className="w-full max-w-md p-8 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                        <p className="text-muted-foreground">Loading invitation details...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!workspace) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md p-8 space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                        "hidden md:flex items-center gap-2 transition-all duration-300",
                    )}>
                        <div className="p-1.5 bg-[#D69D78] rounded-s-2xl rounded-t-2xl border border-black">
                            <Image src={"/logo.svg"} width={45} height={50} alt="logo" />
                        </div>
                        <span className="text-2xl font-semibold">
                            Kopiko
                        </span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Workspace Invitation</h1>
                        <p className="text-muted-foreground">
                            You have been invited to join <span className="font-medium underline decoration-[#D69D78] text-[#D69D78]">{workspace.name}</span> on Kopiko.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleAcceptInvitation}
                        disabled={isAccepting}
                        className="w-full"
                    >
                        {isAccepting ? "Accepting..." : "Accept Invitation"}
                    </Button>
                    <Button
                        onClick={handleDecline}
                        variant="outline"
                        disabled={isAccepting}
                        className="w-full"
                    >
                        Decline
                    </Button>
                </div>
            </Card>
        </div>
    );
} 