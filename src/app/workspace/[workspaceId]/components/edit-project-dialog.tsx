import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'ON_HOLD';
    key: string;
    isPublic: boolean;
    icon?: string;
    backgroundColor?: string;
}

interface EditProjectDialogProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (projectId: string, data: Partial<Project>) => void;
    isLoading: boolean;
}

// const PRESET_COLORS = [
//   '#B07A57', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
//   '#FFEEAD', '#D4A5A5', '#9B6B70', '#E9967A', '#4B4453'
// ];

const CustomColorPicker = ({ color, onChange }: { color: string, onChange: (color: string) => void }) => {
    const [currentColor, setCurrentColor] = useState(color);

    const handleColorChange = (color: string) => {
        setCurrentColor(color);
        onChange(color);
    };

    return (
        <div className="space-y-4 p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <div
                        className="w-12 h-12 rounded-lg shadow-sm border cursor-pointer hover:scale-105 transition-transform"
                        style={{
                            backgroundColor: currentColor,
                            boxShadow: `0 0 10px ${currentColor}40`
                        }}
                        onClick={() => document.getElementById('colorPicker')?.click()}
                    />
                    <input
                        id="colorPicker"
                        type="color"
                        value={currentColor}
                        onChange={(e) => {
                            setCurrentColor(e.target.value);
                        }}
                        onBlur={(e) => {
                            handleColorChange(e.target.value);
                        }}
                        className="absolute opacity-0 w-0 h-0"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Project Color</div>
                    <div className="text-xs text-gray-500">Click the color box to change</div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {['#FF5757', '#FFB657', '#57FF8D', '#57D0FF', '#5770FF', '#A557FF'].map((color) => (
                    <div
                        key={color}
                        className="w-8 h-8 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                        style={{
                            backgroundColor: color,
                            boxShadow: `0 0 8px ${color}40`
                        }}
                        onClick={() => {
                            handleColorChange(color);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const StatusIcon = ({ status }: { status: Project['status'] }) => {
    const statusConfig = {
        ACTIVE: { color: 'text-green-500', bgColor: 'bg-green-500/20' },
        ARCHIVED: { color: 'text-gray-500', bgColor: 'bg-gray-500/20' },
        COMPLETED: { color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
        ON_HOLD: { color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
    };

    return (
        <div className={`w-2 h-2 rounded-full ${statusConfig[status].bgColor}`}>
            <div className={`w-full h-full rounded-full ${statusConfig[status].color} animate-pulse`} />
        </div>
    );
};

export function EditProjectDialog({
    project,
    open,
    onOpenChange,
    onUpdate,
    isLoading
}: EditProjectDialogProps) {
    const [formData, setFormData] = useState(project);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(project);
    }, [project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onUpdate(project.id, formData);
        setIsSaving(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: formData.backgroundColor || '#B07A57' }}
                        />
                        Edit Project
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="transition-all duration-200 focus:scale-[1.01]"
                                placeholder="Enter project name..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="key">Project Key</Label>
                            <Input
                                id="key"
                                value={formData.key}
                                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                                className="font-mono transition-all duration-200 focus:scale-[1.01]"
                                placeholder="PRJ"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[100px] transition-all duration-200 focus:scale-[1.01 ]"
                                placeholder="Describe your project..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: Project['status']) =>
                                    setFormData({ ...formData, status: value })
                                }
                            >
                                <SelectTrigger className="transition-all duration-200 hover:scale-[1.01]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['ACTIVE', 'ARCHIVED', 'COMPLETED', 'ON_HOLD'].map((status) => (
                                        <SelectItem
                                            key={status}
                                            value={status}
                                            className="flex items-center gap-2"
                                        >
                                            <StatusIcon status={status as Project['status']} />
                                            {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Theme Color</Label>
                            <div className="mt-2">
                                <CustomColorPicker
                                    color={formData.backgroundColor || '#B07A57'}
                                    onChange={(color) => setFormData({ ...formData, backgroundColor: color })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="gap-2 min-w-[100px]"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}