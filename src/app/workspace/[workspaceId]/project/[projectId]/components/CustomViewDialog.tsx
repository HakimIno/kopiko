'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useProjectContext } from '../providers/ProjectProvider';

type ViewType = 'kanban' | 'list' | 'calendar' | 'timeline' | 'table' | 'gallery' | 'mindmap';

interface CustomViewDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: {
    id: string;
    name: string;
    type: ViewType;
    filters: Record<string, unknown>;
    sort: {
      field: string;
      direction: 'asc' | 'desc';
    };
    groupBy?: string;
    columns?: string[];
  };
}

const viewTypeOptions: { value: ViewType; label: string; description: string }[] = [
  { value: 'kanban', label: 'Kanban Board', description: 'Drag and drop task management' },
  { value: 'list', label: 'List View', description: 'Detailed list of all tasks' },
  { value: 'calendar', label: 'Calendar View', description: 'Calendar view of tasks and deadlines' },
  { value: 'timeline', label: 'Timeline View', description: 'Gantt chart and timeline view' },
  { value: 'table', label: 'Table View', description: 'Customizable table view' },
  { value: 'gallery', label: 'Gallery View', description: 'Visual gallery of tasks' },
  { value: 'mindmap', label: 'Mind Map View', description: 'Visual mind map of project' },
];

const groupByOptions = [
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'sprint', label: 'Sprint' },
  { value: 'label', label: 'Label' },
  { value: 'dueDate', label: 'Due Date' },
];

const defaultColumns = [
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'createdAt', label: 'Created At' },
  { value: 'updatedAt', label: 'Updated At' },
];

export function CustomViewDialog({
  open,
  onClose,
  initialData,
}: CustomViewDialogProps) {
  const { dispatch } = useProjectContext();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'kanban',
    filters: initialData?.filters || {},
    sort: initialData?.sort || { field: 'createdAt', direction: 'desc' as const },
    groupBy: initialData?.groupBy,
    columns: initialData?.columns || defaultColumns.map(col => col.value),
  });

  const handleSubmit = () => {
    const viewData = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData,
      type: formData.type as ViewType,
    };

    dispatch({
      type: initialData ? 'UPDATE_CUSTOM_VIEW' : 'ADD_CUSTOM_VIEW',
      payload: viewData,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Custom View' : 'Create Custom View'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="My Custom View"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">View Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: ViewType) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select a view type" />
              </SelectTrigger>
              <SelectContent>
                {viewTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div>{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(formData.type === 'kanban' || formData.type === 'list') && (
            <div className="grid gap-2">
              <Label>Group By</Label>
              <Select
                value={formData.groupBy}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, groupBy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  {groupByOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.type === 'table' && (
            <div className="grid gap-2">
              <Label>Default Sort</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.sort.field}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      sort: { ...prev.sort, field: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultColumns.map((col) => (
                      <SelectItem key={col.value} value={col.value}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.sort.direction}
                  onValueChange={(value: 'asc' | 'desc') =>
                    setFormData((prev) => ({
                      ...prev,
                      sort: { ...prev.sort, direction: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name}>
            {initialData ? 'Update View' : 'Create View'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 