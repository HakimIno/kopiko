'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { SprintStatus } from '@prisma/client';

interface SprintData {
    name: string;
    goal?: string;
    startDate: Date;
    endDate: Date;
    status: SprintStatus;
}

interface SprintDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: SprintData) => void;
    initialData?: Partial<SprintData>;
    mode: 'create' | 'edit';
}

export const SprintDialog: React.FC<SprintDialogProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    mode
}) => {
    const [sprintData, setSprintData] = useState<SprintData>({
        name: initialData?.name || '',
        goal: initialData?.goal || '',
        startDate: initialData?.startDate || new Date(),
        endDate: initialData?.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: initialData?.status || 'PLANNING',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(sprintData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] font-anuphan">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create New Sprint' : 'Edit Sprint'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center">
                            Sprint Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={sprintData.name}
                            onChange={(e) => setSprintData({ ...sprintData, name: e.target.value })}
                            placeholder="e.g., Sprint 1"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sprint Goal</label>
                        <Textarea
                            value={sprintData.goal}
                            onChange={(e) => setSprintData({ ...sprintData, goal: e.target.value })}
                            placeholder="What do you want to achieve in this sprint?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                date={sprintData.startDate}
                                onSelect={(date) => date && setSprintData({ ...sprintData, startDate: date })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                date={sprintData.endDate}
                                onSelect={(date) => date && setSprintData({ ...sprintData, endDate: date })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={sprintData.status}
                            onValueChange={(value: SprintStatus) => setSprintData({ ...sprintData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PLANNING">Planning</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {mode === 'create' ? 'Create Sprint' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 