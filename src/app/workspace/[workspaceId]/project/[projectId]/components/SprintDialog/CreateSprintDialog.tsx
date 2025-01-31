'use client';

import React, { useState } from 'react';
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
import { SprintStatus } from '@prisma/client';
import { addDays } from 'date-fns';

interface SprintFormData {
    name: string;
    goal: string;
    startDate: Date;
    endDate: Date;
    status: SprintStatus;
}

interface CreateSprintDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: SprintFormData) => void;
}

export const CreateSprintDialog: React.FC<CreateSprintDialogProps> = ({
    open,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<SprintFormData>({
        name: '',
        goal: '',
        startDate: new Date(),
        endDate: addDays(new Date(), 14), // Default sprint duration: 2 weeks
        status: 'PLANNING',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Sprint</DialogTitle>
                    <DialogDescription>
                        Plan your sprint by filling in the details below. Fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Sprint Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Sprint Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Sprint 1 - User Authentication"
                                required
                            />
                        </div>

                        {/* Sprint Goal */}
                        <div className="space-y-2">
                            <Label htmlFor="goal">Sprint Goal</Label>
                            <Textarea
                                id="goal"
                                value={formData.goal}
                                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                                placeholder="What do you want to achieve in this sprint?"
                                className="min-h-[100px]"
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date <span className="text-red-500">*</span></Label>
                                <DatePicker
                                    date={formData.startDate}
                                    onSelect={(date) => date && setFormData(prev => ({
                                        ...prev,
                                        startDate: date,
                                        // Ensure endDate is not before startDate
                                        endDate: prev.endDate < date ? addDays(date, 14) : prev.endDate,
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date <span className="text-red-500">*</span></Label>
                                <DatePicker
                                    date={formData.endDate}
                                    onSelect={(date) => date && setFormData(prev => ({
                                        ...prev,
                                        endDate: date,
                                    }))}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: SprintStatus) => setFormData(prev => ({ ...prev, status: value }))}
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
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Sprint</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 