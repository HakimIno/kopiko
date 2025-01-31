'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, User2, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTasks } from '@/hooks/use-tasks';
import { useParams } from 'next/navigation';
import { Task, Priority, TaskStatus, Sprint, SprintStatus } from '@prisma/client';
import { format } from 'date-fns';
import { CreateTaskDialog } from '../TaskDialog/CreateTaskDialog';
import { useSprints } from '@/hooks/use-sprints';
import { CreateSprintDialog } from '../SprintDialog/CreateSprintDialog';
import { useBoardStore } from '@/store/use-board-store';

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

interface Column {
    id: string;
    name: string;
    color: string;
}

interface TaskData {
    title: string;
    description?: string;
    priority: Priority;
    status: TaskStatus;
    startDate?: Date;
    dueDate?: Date;
    assigneeId?: string;
    sprintId?: string;
}

const DEFAULT_COLUMNS: Column[] = [
    { id: 'TODO', name: 'To Do', color: 'gray' },
    { id: 'IN_PROGRESS', name: 'In Progress', color: 'blue' },
    { id: 'IN_REVIEW', name: 'In Review', color: 'purple' },
    { id: 'DONE', name: 'Done', color: 'green' }
];

const KanbanColumn: React.FC<{
    column: Column;
    tasks: TaskWithDetails[];
    onDrop: (taskId: string, status: TaskStatus) => void;
    onCreateTask: () => void;
    onEditTask: (task: TaskWithDetails) => void;
    onDeleteTask: (taskId: string) => void;
    onEditColumn: (column: Column) => void;
    onDeleteColumn: (columnId: string) => void;
}> = ({ column, tasks, onDrop, onCreateTask, onEditTask, onDeleteTask, onEditColumn, onDeleteColumn }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        onDrop(taskId, column.id as TaskStatus);
    };

    return (
        <div
            className="flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full bg-${column.color}-500`} />
                    <h3 className="font-medium">{column.name}</h3>
                    <span className="text-sm text-gray-500">{tasks.length}</span>
                </div>
                <div className="flex items-center gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onEditColumn(column)}>
                                Edit Column
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => onDeleteColumn(column.id)}
                                className="text-red-600"
                            >
                                Delete Column
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" onClick={onCreateTask}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-3 overflow-x-auto">
                {tasks.map((task) => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                    />
                ))}
            </div>
        </div>
    );
};

const TaskCard: React.FC<{ 
    task: TaskWithDetails;
    onEdit: (task: TaskWithDetails) => void;
    onDelete: (taskId: string) => void;
}> = ({ task, onEdit, onDelete }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 cursor-move hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">#{task.taskNumber}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                            Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => onDelete(task.id)}
                            className="text-red-600"
                        >
                            Delete Task
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <h4 className="font-medium mb-2">{task.title}</h4>
            {task.description && (
                <p className="text-sm text-gray-500 mb-3">{task.description}</p>
            )}

            <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'HIGHEST' ? 'bg-red-100 text-red-700' :
                    task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    task.priority === 'LOW' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                }`}>
                    {task.priority}
                </span>
                {task.labels.map((label) => (
                    <span
                        key={label.id}
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                            backgroundColor: `${label.color}20`,
                            color: label.color,
                        }}
                    >
                        {label.name}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    {task.assignee ? (
                        <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback>
                                    {task.assignee.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span>{task.assignee.name}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <User2 className="h-4 w-4" />
                            <span>Unassigned</span>
                        </div>
                    )}
                </div>
                {task.dueDate && (
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface SprintFormData {
    name: string;
    goal: string;
    startDate: Date;
    endDate: Date;
    status: SprintStatus;
}

const KanbanView = () => {
    const params = useParams();
    const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
    const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<Column | null>(null);
    const [newColumnName, setNewColumnName] = useState('');
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
    const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
    const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>('TODO');
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
    const { selectedSprintId, setSelectedSprintId } = useBoardStore();
    
    const { tasks, isLoading: isLoadingTasks, createTask, updateTask, deleteTask } = useTasks(
        params.workspaceId as string,
        params.projectId as string
    );

    const { sprints, isLoading: isLoadingSprints, createSprint } = useSprints(
        params.workspaceId as string,
        params.projectId as string
    );

    const handleCreateTask = async (taskData: TaskData) => {
        try {
            await createTask.mutateAsync({
                ...taskData,
                status: createTaskStatus,
            });
            setIsCreateTaskOpen(false);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleDrop = async (taskId: string, status: TaskStatus) => {
        try {
            await updateTask.mutateAsync({
                taskId,
                data: {
                    status,
                    isBlocked: status === 'BLOCKED',
                    ...(status !== 'BLOCKED' && { isBlocked: false, blockReason: null }),
                }
            });
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleCreateSprint = async (sprintData: SprintFormData) => {
        try {
            await createSprint.mutateAsync({
                ...sprintData,
                startDate: sprintData.startDate.toISOString(),
                endDate: sprintData.endDate.toISOString(),
            });
            setIsCreateSprintOpen(false);
        } catch (error) {
            console.error('Failed to create sprint:', error);
        }
    };

    const handleEditTask = (task: TaskWithDetails) => {
        setSelectedTask(task);
        setIsEditTaskOpen(true);
    };

    const handleUpdateTask = async (taskData: TaskData) => {
        if (!selectedTask) return;
        
        try {
            await updateTask.mutateAsync({
                taskId: selectedTask.id,
                data: {
                    title: taskData.title,
                    description: taskData.description,
                    priority: taskData.priority,
                    status: taskData.status,
                    startDate: taskData.startDate,
                    dueDate: taskData.dueDate,
                    assigneeId: taskData.assigneeId,
                }
            });
            setIsEditTaskOpen(false);
            setSelectedTask(null);
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask.mutateAsync(taskId);
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    // Add proper types to sprint filtering
    const sprintsList = sprints?.sprints as Sprint[] | undefined;
    
    const filteredTasks = tasks?.tasks?.filter((task: TaskWithDetails) => {
        // Filter by sprint
        if (selectedSprintId === 'backlog') {
            if (task.sprintId) return false;
        } else if (task.sprintId !== selectedSprintId) {
            return false;
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!task.title.toLowerCase().includes(query) &&
                !task.description?.toLowerCase().includes(query)) {
                return false;
            }
        }
        
        // Filter by priority
        if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
            return false;
        }
        
        return true;
    });

    const handleCreateColumn = () => {
        if (!newColumnName.trim()) return;
        
        const newColumn: Column = {
            id: newColumnName.toUpperCase().replace(/\s+/g, '_'),
            name: newColumnName,
            color: 'gray'
        };
        
        setColumns([...columns, newColumn]);
        setNewColumnName('');
        setIsCreateColumnOpen(false);
    };

    const handleEditColumn = (column: Column) => {
        setEditingColumn(column);
        setNewColumnName(column.name);
        setIsCreateColumnOpen(true);
    };

    const handleUpdateColumn = () => {
        if (!editingColumn || !newColumnName.trim()) return;
        
        setColumns(columns.map(col => 
            col.id === editingColumn.id 
                ? { ...col, name: newColumnName }
                : col
        ));
        
        setNewColumnName('');
        setEditingColumn(null);
        setIsCreateColumnOpen(false);
    };

    const handleDeleteColumn = (columnId: string) => {
        setColumns(columns.filter(col => col.id !== columnId));
    };

    if (isLoadingTasks || isLoadingSprints) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 font-anuphan">
            {/* Filters and Search */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Sprint Selection */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                {selectedSprintId === 'backlog' ? 'Backlog' : 
                                    sprintsList?.find((sprint: Sprint) => sprint.id === selectedSprintId)?.name || 'Select Sprint'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedSprintId('backlog')}>
                                Backlog
                            </DropdownMenuItem>
                            {sprintsList?.map((sprint: Sprint) => (
                                <DropdownMenuItem 
                                    key={sprint.id}
                                    onClick={() => setSelectedSprintId(sprint.id)}
                                >
                                    {sprint.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

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
                                Priority: {priorityFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setPriorityFilter('ALL')}>
                                All
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPriorityFilter('HIGHEST')}>
                                Highest
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPriorityFilter('HIGH')}>
                                High
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPriorityFilter('MEDIUM')}>
                                Medium
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPriorityFilter('LOW')}>
                                Low
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPriorityFilter('LOWEST')}>
                                Lowest
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsCreateColumnOpen(true)} variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Column
                    </Button>
                    <Button onClick={() => setIsCreateTaskOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Task
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-6">
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        tasks={filteredTasks?.filter((task: TaskWithDetails) => task.status === column.id) || []}
                        onDrop={handleDrop}
                        onCreateTask={() => {
                            setCreateTaskStatus(column.id as TaskStatus);
                            setIsCreateTaskOpen(true);
                        }}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                        onEditColumn={handleEditColumn}
                        onDeleteColumn={handleDeleteColumn}
                    />
                ))}
            </div>

            {/* Column Dialog */}
            <Dialog open={isCreateColumnOpen} onOpenChange={setIsCreateColumnOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingColumn ? 'Edit Column' : 'Create New Column'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Column Name</label>
                            <Input
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                placeholder="Enter column name..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setNewColumnName('');
                                setEditingColumn(null);
                                setIsCreateColumnOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={editingColumn ? handleUpdateColumn : handleCreateColumn}>
                            {editingColumn ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Other dialogs */}
            <CreateTaskDialog
                open={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                onSubmit={(data) => handleCreateTask({
                    ...data,
                    sprintId: selectedSprintId === 'backlog' ? undefined : selectedSprintId
                })}
            />

            <CreateTaskDialog
                open={isEditTaskOpen}
                onClose={() => {
                    setIsEditTaskOpen(false);
                    setSelectedTask(null);
                }}
                onSubmit={handleUpdateTask}
                initialData={selectedTask || undefined}
            />

            <CreateSprintDialog
                open={isCreateSprintOpen}
                onClose={() => setIsCreateSprintOpen(false)}
                onSubmit={handleCreateSprint}
            />
        </div>
    );
};

export default KanbanView;