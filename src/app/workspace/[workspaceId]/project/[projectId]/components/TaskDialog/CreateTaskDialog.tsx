'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Priority, TaskStatus, Task } from '@prisma/client';

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
    startDate: Date | undefined;
    dueDate: Date | undefined;
    assigneeId: string | undefined;
    timeEstimate: number | undefined;
    isBlocked: boolean;
    blockReason: string;
}

interface CreateTaskDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => void;
    initialStatus?: TaskStatus;
    initialData?: TaskWithDetails;
    sprintId?: string;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
    open,
    onClose,
    onSubmit,
    initialStatus = 'TODO',
    initialData
}) => {
    const [formData, setFormData] = useState<TaskFormData>(() => {
        if (initialData) {
            return {
                title: initialData.title,
                description: initialData.description || '',
                priority: initialData.priority,
                status: initialData.status,
                startDate: initialData.startDate || undefined,
                dueDate: initialData.dueDate || undefined,
                assigneeId: initialData.assigneeId || undefined,
                timeEstimate: initialData.timeEstimate || undefined,
                isBlocked: initialData.isBlocked,
                blockReason: initialData.blockReason || '',
            };
        }
        return {
            title: '',
            description: '',
            priority: 'MEDIUM',
            status: initialStatus,
            startDate: undefined,
            dueDate: undefined,
            assigneeId: undefined,
            timeEstimate: undefined,
            isBlocked: false,
            blockReason: '',
        };
    });

    // Reset form when dialog opens/closes or initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description || '',
                priority: initialData.priority,
                status: initialData.status,
                startDate: initialData.startDate || undefined,
                dueDate: initialData.dueDate || undefined,
                assigneeId: initialData.assigneeId || undefined,
                timeEstimate: initialData.timeEstimate || undefined,
                isBlocked: initialData.isBlocked,
                blockReason: initialData.blockReason || '',
            });
        } else {
            setFormData({
                title: '',
                description: '',
                priority: 'MEDIUM',
                status: initialStatus,
                startDate: undefined,
                dueDate: undefined,
                assigneeId: undefined,
                timeEstimate: undefined,
                isBlocked: false,
                blockReason: '',
            });
        }
    }, [open, initialData, initialStatus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                    <DialogDescription>
                        {initialData 
                            ? 'Update the task details below.'
                            : 'Fill in the task details. Fields marked with * are required.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Task title"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Task description"
                                className="min-h-[100px]"
                            />
                        </div>

                        {/* Priority and Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGHEST">Highest</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="LOWEST">Lowest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: TaskStatus) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODO">To Do</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                        <SelectItem value="DONE">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <DatePicker
                                    date={formData.startDate}
                                    onSelect={(date: Date | undefined) => setFormData(prev => ({ ...prev, startDate: date }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <DatePicker
                                    date={formData.dueDate}
                                    onSelect={(date: Date | undefined) => setFormData(prev => ({ ...prev, dueDate: date }))}
                                />
                            </div>
                        </div>

                        {/* Time Estimate */}
                        <div className="space-y-2">
                            <Label htmlFor="timeEstimate">Time Estimate (minutes)</Label>
                            <Input
                                id="timeEstimate"
                                type="number"
                                min="0"
                                value={formData.timeEstimate || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    timeEstimate: e.target.value ? parseInt(e.target.value) : undefined
                                }))}
                                placeholder="Estimated time in minutes"
                            />
                        </div>

                        {/* Blocked Status */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isBlocked"
                                    checked={formData.isBlocked}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isBlocked: e.target.checked }))}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="isBlocked">Task is Blocked</Label>
                            </div>
                            {formData.isBlocked && (
                                <Textarea
                                    value={formData.blockReason}
                                    onChange={(e) => setFormData(prev => ({ ...prev, blockReason: e.target.value }))}
                                    placeholder="Why is this task blocked?"
                                    className="mt-2"
                                />
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {initialData ? 'Update Task' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 