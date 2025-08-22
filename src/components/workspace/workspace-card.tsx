"use client";

import { Card } from "@/components/ui/card";
import { UsersIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { useState } from "react";
import { EditWorkspaceDialog } from "./edit-workspace-dialog";
import { useDeleteWorkspace } from "@/hooks/use-workspace-query";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define WorkspaceRole enum to match Prisma schema
enum WorkspaceRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER'
}

interface WorkspaceCardProps {
    workspace: {
        id: string;
        name: string;
        description?: string;
        icon?: string;
        theme?: {
            color: string;
        };
        owner: {
            id: string;
            name: string;
            email: string;
        };
        _count?: {
            projects: number;
            members: number;
        };
        role?: WorkspaceRole;
        userId?: string;
        canEdit?: boolean;
        canDelete?: boolean;
    };
    viewMode?: 'grid' | 'list';
}

export function WorkspaceCard({ workspace, viewMode = 'grid' }: WorkspaceCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const deleteWorkspaceMutation = useDeleteWorkspace();

    const handleDelete = async () => {
        try {
            await deleteWorkspaceMutation.mutateAsync(workspace.id);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete workspace:', error);
        }
    };

    const actionButtons = (
        <div className="flex items-center gap-2">
            {workspace.canEdit && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditDialogOpen(true)}
                >
                    <PencilIcon className="h-4 w-4" />
                </Button>
            )}
            {workspace.canDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                >
                    <TrashIcon className="h-4 w-4" />
                </Button>
            )}
        </div>
    );

    if (viewMode === 'list') {
        return (
            <>
                <Card className="relative overflow-hidden group border-none bg-background">
                    {/* <div className="absolute top-0 left-0 bottom-0 w-2"
                        style={{ backgroundColor: workspace.theme?.color || "#4F46E5" }}
                    /> */}
                    <div className="p-4 flex items-center gap-4">
                        <Link href={`/workspace/${workspace.id}`} className="flex-1">
                            <div className="flex items-center gap-4">
                                {workspace.icon ? (
                                    <div className="p-1 rounded-lg" style={{ backgroundColor: workspace.theme?.color || "#4F46E5" }}>
                                        <Image
                                            src={workspace.icon}
                                            alt={workspace.name}
                                            width={40}
                                            height={40}

                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-semibold"
                                        style={{ backgroundColor: workspace.theme?.color || "#4F46E5" }}
                                    >
                                        {workspace.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                        {workspace.name}
                                    </h3>
                                    {workspace.description && (
                                        <p className="text-sm text-muted-foreground truncate">
                                            {workspace.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <UsersIcon className="w-4 h-4" />
                                <span>{workspace._count?.members || 1} members</span>
                            </div>
                            <div>•</div>
                            <div>{workspace._count?.projects || 0} projects</div>
                        </div>

                        {actionButtons}
                    </div>
                </Card>

                <EditWorkspaceDialog
                    workspace={workspace}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                />
            </>
        );
    }

    return (
        <>
            <Card
                className={`h-48 cursor-pointer relative overflow-hidden group border-none  bg-background `}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-start gap-4">
                        <Link href={`/workspace/${workspace.id}`} className="flex-1">
                            <div className="flex items-start gap-4">
                                {workspace.icon ? (
                                    <div className="p-1 rounded-lg" style={{ backgroundColor: workspace.theme?.color || "#4F46E5" }}>
                                        <Image
                                            src={workspace.icon}
                                            alt={workspace.name}
                                            width={40}
                                            height={40}

                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-semibold"
                                        style={{ backgroundColor: workspace.theme?.color || "#4F46E5" }}
                                    >
                                        {workspace.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                        {workspace.name}
                                    </h3>
                                    {workspace.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {workspace.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>

                        {actionButtons}
                    </div>

                    <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <UsersIcon className="w-4 h-4" />
                            <span>{workspace._count?.members || 1} members</span>
                        </div>
                        <div>•</div>
                        <div>{workspace._count?.projects || 0} projects</div>
                    </div>
                </div>
            </Card>

            <EditWorkspaceDialog
                workspace={workspace}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            workspace and all of its data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 