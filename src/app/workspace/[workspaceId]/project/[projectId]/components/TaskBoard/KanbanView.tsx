import React, { useState } from 'react';
import {
    Plus, Edit2, X,
    Calendar, User
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Types
interface Task {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    dueDate: string;
    assignee: string;
    labels: string[];
    columnId: string;
}

type Priority = 'Low' | 'Medium' | 'High';

interface Column {
    id: string;
    title: string;
    color: string;
    order: number;
}

interface TaskItemProps {
    task: Task;
    onDelete: () => void;
    onEdit: (task: Task) => void;
    isDragging: boolean;
}

interface TaskEditorProps {
    task: Task | null;
    onSave: (task: Task) => void;
    onCancel: () => void;
    columnId: string;
}

const COLUMNS: Column[] = [
    { id: 'todo', title: 'TO DO', color: 'from-blue-500 to-blue-600', order: 0 },
    { id: 'inProgress', title: 'IN PROGRESS', color: 'from-yellow-500 to-yellow-600', order: 1 },
    { id: 'done', title: 'DONE', color: 'from-green-500 to-green-600', order: 2 }
];

const priorityColors: Record<Priority, string> = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
};

const colors: Record<Priority, string> = {
    Low: '#5770FF',
    Medium: '#FFB657',
    High: '#FF5757'
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onEdit, isDragging }) => {
    return (
        <div className={`
            group relative bg-[#F6F4EE] dark:bg-[#2B2B29] rounded-lg p-4 shadow-sm
            ${isDragging ? 'shadow-lg ring-2 ring-blue-500 opacity-90' : ''}
            transition-all duration-200
        `}>
            <div
                className="absolute -top-0 -right-0 w-16 h-16 rounded-full blur-2xl opacity-25 group-hover:opacity-30 transition-all duration-500"
                style={{ backgroundColor: colors[task.priority] }}
            />
            <div
                className="absolute bottom-0 left-0 w-20 h-20 rounded-full blur-2xl opacity-25 group-hover:opacity-30 transition-all duration-500"
                style={{ backgroundColor: colors[task.priority] }}
            />
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(task)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
                    >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
                {task.labels.map((label, index) => (
                    <span
                        key={`${task.id}-${label}-${index}`}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                    >
                        {label}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-500 dark:text-white" />
                        <span className="text-gray-700 dark:text-white text-xs">{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-white" />
                        <span className="text-gray-700 dark:text-white text-xs">{task.dueDate}</span>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
            </div>
        </div>
    );
};

const TaskEditor: React.FC<TaskEditorProps> = ({ task, onSave, onCancel, columnId }) => {
    const [editedTask, setEditedTask] = useState<Task>({
        id: task?.id || `new-task-${Date.now()}`,
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'Medium',
        dueDate: task?.dueDate || '',
        assignee: task?.assignee || '',
        labels: task?.labels || [],
        columnId: columnId
    });

    const handleSave = () => {
        if (!editedTask.title.trim()) {
            alert('Title is required');
            return;
        }
        onSave(editedTask);
    };

    return (
        <Dialog open={true} onOpenChange={() => onCancel()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
                    <DialogDescription>
                        Fill in the task details below. Fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={editedTask.title}
                            onChange={e => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                            className="flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            value={editedTask.description}
                            onChange={e => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                            className="flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <select
                                value={editedTask.priority}
                                onChange={e => setEditedTask(prev => ({ ...prev, priority: e.target.value as Priority }))}
                                className="flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <input
                                type="date"
                                value={editedTask.dueDate}
                                onChange={e => setEditedTask(prev => ({ ...prev, dueDate: e.target.value }))}
                                className="flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Assignee</label>
                        <input
                            type="text"
                            value={editedTask.assignee}
                            onChange={e => setEditedTask(prev => ({ ...prev, assignee: e.target.value }))}
                            className="flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Labels</label>
                        <input
                            type="text"
                            value={editedTask.labels.join(', ')}
                            onChange={e => {
                                const newLabels = e.target.value.split(',').map(label => label.trim()).filter(Boolean);
                                setEditedTask(prev => ({ ...prev, labels: newLabels }));
                            }}
                            className="flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                            placeholder="Enter labels separated by commas"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave}>
                        {task ? 'Save Changes' : 'Create Task'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const KanbanBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);

    const getColumnTasks = (columnId: string): Task[] => {
        return tasks.filter(task => task.columnId === columnId);
    };

    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDrop = (targetColumnId: string) => {
        if (!draggedTask || targetColumnId === draggedTask.columnId) return;

        setTasks(prev => prev.map(task =>
            task.id === draggedTask.id
                ? { ...task, columnId: targetColumnId }
                : task
        ));
        setDraggedTask(null);
    };

    const handleAddTask = (columnId: string) => {
        setEditingTask(null);
        setEditingColumnId(columnId);
    };

    const handleSaveTask = (task: Task) => {
        setTasks(prev => {
            const existingTask = prev.find(t => t.id === task.id);
            if (existingTask) {
                return prev.map(t => t.id === task.id ? task : t);
            } else {
                return [...prev, task];
            }
        });
        setEditingTask(null);
        setEditingColumnId(null);
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
    };

    return (
        <div className="p-6">
            <div className="flex gap-6 overflow-x-auto pb-4">
                {COLUMNS.map(column => (
                    <div
                        key={column.id}
                        className="w-80 flex-shrink-0"
                        onDragOver={(e: React.DragEvent) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={() => handleDrop(column.id)}
                    >
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm overflow-hidden">

                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-[#1a1a1a] dark:text-white">{column.title}</h3>
                                    <span className="text-sm text-gray-500">
                                        {getColumnTasks(column.id).length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleAddTask(column.id)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-2 space-y-2">
                                {getColumnTasks(column.id).map(task => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={() => handleDragStart(task)}
                                        className={draggedTask?.id === task.id ? 'opacity-50' : ''}
                                    >
                                        <TaskItem
                                            task={task}
                                            onDelete={() => handleDeleteTask(task.id)}
                                            onEdit={() => setEditingTask(task)}
                                            isDragging={draggedTask?.id === task.id}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(editingTask || editingColumnId) && (
                <TaskEditor
                    task={editingTask}
                    onSave={handleSaveTask}
                    onCancel={() => {
                        setEditingTask(null);
                        setEditingColumnId(null);
                    }}
                    columnId={editingTask?.columnId || editingColumnId || ''}
                />
            )}
        </div>
    );
};

export default KanbanBoard;