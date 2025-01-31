'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TableView() {
  const [tasks] = useState([
    {
      id: '1',
      title: 'Example Task 1',
      status: 'In Progress',
      priority: 'High',
      assignee: 'John Doe',
      dueDate: '2024-03-20',
    },
    {
      id: '2',
      title: 'Example Task 2',
      status: 'To Do',
      priority: 'Medium',
      assignee: 'Jane Smith',
      dueDate: '2024-03-25',
    },
  ]);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'dueDate', label: 'Due Date' },
  ];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              {columns.map((column) => (
                <TableCell key={`${task.id}-${column.key}`}>
                  {task[column.key as keyof typeof task]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 