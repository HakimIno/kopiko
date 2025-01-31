'use client';

import { useState } from 'react';

export default function TimelineView() {
  const [tasks] = useState([
    {
      id: '1',
      title: 'Example Task 1',
      startDate: '2024-03-15',
      endDate: '2024-03-20',
      status: 'In Progress',
      assignee: 'John Doe',
    },
    {
      id: '2',
      title: 'Example Task 2',
      startDate: '2024-03-18',
      endDate: '2024-03-25',
      status: 'To Do',
      assignee: 'Jane Smith',
    },
  ]);

  // Placeholder for timeline implementation
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Timeline View</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border rounded-lg bg-background shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{task.title}</h3>
              <span className="text-sm text-muted-foreground">
                {task.startDate} - {task.endDate}
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <div>Status: {task.status}</div>
              <div>Assignee: {task.assignee}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 