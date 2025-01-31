'use client';

import React, { useState } from 'react';
import { Plus, User2, MoreHorizontal, Clock, Filter, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useTasks } from "@/hooks/use-tasks";
import { useParams } from "next/navigation";
import { Task, Priority, TaskStatus } from "@prisma/client";
import { format } from "date-fns";
import { CreateTaskDialog } from "../TaskDialog/CreateTaskDialog";

interface TaskWithDetails extends Task {
    assignee?: {
        id: string;
        name: string;
        email: string;
    };
    reporter: {
        id: string;
        name: string;
        email: string;
    };
    labels: {
        id: string;
        name: string;
        color: string;
    }[];
}

interface TaskFormData {
    title: string;
    description: string;
    priority: Priority;
    status: TaskStatus;
    startDate?: Date;
    dueDate?: Date;
    assigneeId?: string;
    timeEstimate?: number;
    isBlocked: boolean;
    blockReason: string;
}

const ListView = () => {
    const params = useParams();
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
    const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");
    
    const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks(
        params.workspaceId as string,
        params.projectId as string
    );

    const handleCreateTask = async (taskData: TaskFormData) => {
        try {
            await createTask.mutateAsync({
                ...taskData,
                status: taskData.status || 'TODO'
            });
            setIsCreateTaskOpen(false);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
        try {
            await updateTask.mutateAsync({
                taskId,
                data: { status }
            });
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask.mutateAsync(taskId);
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const filteredTasks = tasks?.tasks?.filter((task: TaskWithDetails) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!task.title.toLowerCase().includes(query) &&
                !task.description?.toLowerCase().includes(query)) {
                return false;
            }
        }
        
        if (statusFilter !== "ALL" && task.status !== statusFilter) {
            return false;
        }
        
        if (priorityFilter !== "ALL" && task.priority !== priorityFilter) {
            return false;
        }
        
        return true;
    });

    if (isLoading) {
        return <div className="p-8 text-center">Loading tasks...</div>;
    }

    return (
        <div className="p-6">
            {/* Filters and Search */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Status: {statusFilter}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("TODO")}>
                                    To Do
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("IN_PROGRESS")}>
                                    In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("IN_REVIEW")}>
                                    In Review
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("DONE")}>
                                    Done
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Priority: {priorityFilter}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setPriorityFilter("ALL")}>
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPriorityFilter("HIGHEST")}>
                                    Highest
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPriorityFilter("HIGH")}>
                                    High
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPriorityFilter("MEDIUM")}>
                                    Medium
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPriorityFilter("LOW")}>
                                    Low
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPriorityFilter("LOWEST")}>
                                    Lowest
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Button onClick={() => setIsCreateTaskOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Task
                    </Button>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks?.map((task: TaskWithDetails) => (
                            <TableRow key={task.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{task.title}</div>
                                        {task.description && (
                                            <div className="text-sm text-gray-500">{task.description}</div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className={`w-[110px] justify-start gap-2 ${
                                                    task.status === 'DONE' ? 'text-green-600' :
                                                    task.status === 'IN_PROGRESS' ? 'text-blue-600' :
                                                    task.status === 'IN_REVIEW' ? 'text-purple-600' :
                                                    'text-gray-600'
                                                }`}
                                            >
                                                <span className="h-2 w-2 rounded-full bg-current" />
                                                {task.status}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, "TODO")}>
                                                To Do
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}>
                                                In Progress
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, "IN_REVIEW")}>
                                                In Review
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, "DONE")}>
                                                Done
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                        task.priority === 'HIGHEST' ? 'bg-red-100 text-red-700' :
                                        task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                        task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                        task.priority === 'LOW' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {task.priority}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {task.assignee ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback>
                                                    {task.assignee.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{task.assignee.name}</span>
                                        </div>
                                    ) : (
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <User2 className="h-4 w-4" />
                                            Unassigned
                                        </Button>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {task.dueDate ? (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">
                                                {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">No due date</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-500">
                                        {format(new Date(task.createdAt), 'MMM d, yyyy')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                            <DropdownMenuItem 
                                                className="text-red-600"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                Delete Task
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <CreateTaskDialog
                open={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                onSubmit={handleCreateTask}
            />
        </div>
    );
};

export default ListView;