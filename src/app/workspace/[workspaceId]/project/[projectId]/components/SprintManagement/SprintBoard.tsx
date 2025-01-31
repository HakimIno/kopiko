'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Target, Calendar, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CreateTaskDialog } from '../TaskDialog/CreateTaskDialog';
import { useTasks } from '@/hooks/use-tasks';
import { useSprints } from '@/hooks/use-sprints';
import { useParams } from 'next/navigation';
import { Task, Sprint, Priority, TaskStatus } from '@prisma/client';
import { SprintDialog } from './SprintDialog';
import SprintSkeleton from './SprintSkeleton';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreateSprintDialog } from '../SprintDialog/CreateSprintDialog';

interface TaskWithDetails extends Task {
    assignee?: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
    reporter: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
    labels: {
        id: string;
        name: string;
        color: string;
    }[];
}

interface SprintWithTasks extends Sprint {
    tasks: TaskWithDetails[];
}

interface TaskData {
    title: string;
    description?: string;
    priority: Priority;
    status: TaskStatus;
    startDate?: Date;
    dueDate?: Date;
    assigneeId?: string;
}

interface SprintData {
    name: string;
    goal?: string;
    startDate: Date;
    endDate: Date;
    status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

const TaskItem: React.FC<{ task: TaskWithDetails }> = ({ task }) => {
    const getPriorityStyles = (priority: Priority) => {
        const styles = {
            'HIGH': 'bg-red-100 text-rose-700 dark:bg-red-900/30 dark:text-rose-300',
            'MEDIUM': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
            'LOW': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'LOWEST': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        };
        return styles[priority as keyof typeof styles];
    };

    const getStatusStyles = (status: TaskStatus) => {
        const styles = {
            'DONE': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            'IN_PROGRESS': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'TODO': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        };
        return styles[status as keyof typeof styles];
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="group font-anuphan"
        >
            <Card
                className="hover:shadow-md cursor-move bg-white dark:bg-black/40"
                draggable="true"
                onDragStart={handleDragStart}
            >
                <CardContent className="p-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-base">{task.title}</h4>
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                #{task.taskNumber}
                            </span>
                        </div>

                        {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        <div className="flex items-center gap-2">
                            <div className="flex flex-wrap gap-2 flex-1">
                                <Badge variant="secondary" className={getPriorityStyles(task.priority)}>
                                    {task.priority}
                                </Badge>
                                <Badge variant="secondary" className={getStatusStyles(task.status)}>
                                    {task.status.replace('_', ' ')}
                                </Badge>
                                {task.labels && task.labels.map(label => (
                                    <Badge
                                        key={label.id}
                                        variant="outline"
                                        style={{
                                            backgroundColor: `${label.color}20`,
                                            color: label.color,
                                            borderColor: label.color
                                        }}
                                    >
                                        {label.name}
                                    </Badge>
                                ))}
                            </div>

                            {task.assignee && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={task.assignee.image} />
                                                <AvatarFallback>
                                                    {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Assigned to {task.assignee.name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        {(task.startDate || task.dueDate) && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {task.startDate && format(new Date(task.startDate), 'MMM d')}
                                {task.startDate && task.dueDate && ' - '}
                                {task.dueDate && format(new Date(task.dueDate), 'MMM d')}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const SprintSection: React.FC<{ sprint: SprintWithTasks, deleteSprint: (sprintId: string) => void }> = ({ sprint, deleteSprint }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const params = useParams();
    const { createTask, updateTaskSprint } = useTasks(
        params.workspaceId as string,
        params.projectId as string,
        sprint.id
    );

    const getSprintStatusColor = (status: string) => {
        const statusColors = {
            'PLANNING': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            'ACTIVE': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'COMPLETED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
        return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isDragOver) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const taskId = e.dataTransfer.getData('taskId');
        if (!taskId) return;

        try {
            await updateTaskSprint.mutateAsync({
                taskId,
                sprintId: sprint.id
            });
        } catch (error) {
            console.error('Failed to move task:', error);
        }
    };

    const handleCreateTask = async (taskData: TaskData) => {
        try {
            await createTask.mutateAsync({
                ...taskData,
                sprintId: sprint.id,
            });
            setIsCreateTaskOpen(false);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    return (
        <AnimatePresence >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={sprint.id}
            >
                <Card
                    className={`group relative overflow-hidden backdrop-blur-sm border-none  ${isDragOver ? 'ring-2 ring-blue-500 dark:ring-blue-400 ' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >

                    <CardHeader className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-1 p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 "
                                >
                                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                                </motion.div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold">{sprint.name}</h3>
                                            <Badge variant="secondary" className={getSprintStatusColor(sprint.status)}>
                                                {sprint.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d')}
                                            </div>
                                            {sprint.goal && (
                                                <div className="flex items-center gap-1">
                                                    <Target className="w-4 h-4" />
                                                    {sprint.goal}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCreateTaskOpen(true);
                                    }}
                                    className="shrink-0"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task
                                </Button>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteSprint(sprint.id)}
                                    disabled={false}
                                    className="h-8 w-8 p-0 rounded-xl text-white hover:bg-none"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                            </div>
                        </div>
                    </CardHeader>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CardContent className="border-t bg-gray-50/50 dark:bg-black/20">
                                    <div className="space-y-3 py-4">
                                        {sprint.tasks.map((task) => (
                                            <TaskItem key={task.id} task={task} />
                                        ))}
                                        {sprint.tasks.length === 0 && (
                                            <div className="text-center py-12 text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <AlertCircle className="w-6 h-6" />
                                                    <p>No tasks in this sprint yet</p>
                                                    <p className="text-sm">Start by adding a new task</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            <CreateTaskDialog
                open={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                onSubmit={handleCreateTask}
                sprintId={sprint.id}
            />

        </AnimatePresence>
    );
};

const SprintBoard: React.FC = () => {
    const params = useParams();
    const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<SprintWithTasks | null>(null);

    const { sprints, isLoading, error, createSprint, updateSprint, deleteSprint } = useSprints(
        params.workspaceId as string,
        params.projectId as string
    );

    const handleCreateSprint = async (data: SprintData) => {
        try {
            await createSprint.mutateAsync({
                ...data,
                startDate: data.startDate.toISOString(),
                endDate: data.endDate.toISOString(),
            });
            setIsCreateSprintOpen(false);
        } catch (error) {
            console.error('Failed to create sprint:', error);
        }
    };

    const handleDeleteSprint = async (sprintId: string) => {
        try {
            await deleteSprint.mutateAsync(sprintId);
            setIsCreateSprintOpen(false);
        } catch (error) {
            console.error('Failed to create sprint:', error);
        }
    };

    const handleUpdateSprint = async (data: SprintData) => {
        if (!editingSprint) return;

        try {
            await updateSprint.mutateAsync({
                sprintId: editingSprint.id,
                data: {
                    ...data,
                    startDate: data.startDate.toISOString(),
                    endDate: data.endDate.toISOString(),
                },
            });
            setEditingSprint(null);
        } catch (error) {
            console.error('Failed to update sprint:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center max-w-7xl mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-4 text-lg">
                    Error: {error instanceof Error ? error.message : 'Failed to load sprints'}
                </p>
                <Button onClick={() => setIsCreateSprintOpen(true)} variant="outline" size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Sprint
                </Button>
            </div>
        );
    }

    const sprintsWithTasks = sprints?.sprints || [];


    return (
        <div className="p-6 space-y-6 mx-auto font-anuphan">
            {sprintsWithTasks.length === 0 ? (
                <div className="p-8 text-center  mx-auto font-anuphan">
                    <div className="max-w-md mx-auto">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Sprints Found</h3>
                        <p className="text-gray-500 mb-6">
                            Get started by creating your first sprint to organize and track your team's work.
                        </p>
                        <Button onClick={() => setIsCreateSprintOpen(true)} size="default">
                            <Plus className="w-5 h-5 mr-2" />
                            Create Sprint
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center">
                    <div className=""></div>
                    <Button onClick={() => setIsCreateSprintOpen(true)} size="default">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Sprint
                    </Button>
                </div>
            )}


            <motion.div
                className="space-y-6"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {sprintsWithTasks.map((sprint: SprintWithTasks) => (
                    <SprintSection key={sprint.id} sprint={sprint} deleteSprint={handleDeleteSprint} />
                ))}
            </motion.div>

            <SprintDialog
                open={isCreateSprintOpen || !!editingSprint}
                onClose={() => {
                    setIsCreateSprintOpen(false);
                    setEditingSprint(null);
                }}
                onSubmit={editingSprint ? handleUpdateSprint : handleCreateSprint}
                initialData={editingSprint ? {
                    name: editingSprint.name,
                    goal: editingSprint.goal || undefined,
                    startDate: new Date(editingSprint.startDate),
                    endDate: new Date(editingSprint.endDate),
                    status: editingSprint.status,
                } : undefined}
                mode={editingSprint ? 'edit' : 'create'}
            />


        </div>
    );
};

export default SprintBoard;