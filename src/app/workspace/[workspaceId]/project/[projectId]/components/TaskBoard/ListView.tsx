'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, User2, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type TaskStatus = 'DEPLOYMENT' | 'VALIDATE' | 'COMPLETED' | 'IN PROGRESS' | 'PLAN';
type PriorityLevel = 'High' | 'Normal' | 'Low';

interface Assignee {
    name: string;
    avatar: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    priority: PriorityLevel;
    status: TaskStatus;
    assignees?: Assignee[];
    startDate?: string;
    dueDate?: string;
    reporter?: string;
}

interface StatusColor {
    bg: string;
    text: string;
}

interface PriorityStyle {
    icon: string;
    color: string;
}

const statusColors: Record<TaskStatus, StatusColor> = {
    'DEPLOYMENT': { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    'VALIDATE': { bg: 'bg-orange-100', text: 'text-orange-800' },
    'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800' },
    'IN PROGRESS': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'PLAN': { bg: 'bg-gray-100', text: 'text-gray-800' },
};

const priorityColors: Record<PriorityLevel, PriorityStyle> = {
    'High': { icon: '🟨', color: 'text-yellow-500' },
    'Normal': { icon: '🟦', color: 'text-blue-500' },
    'Low': { icon: '⬜', color: 'text-gray-500' },
};

const initialTasks: Task[] = [
    {
        id: '1',
        title: '27-09-2024 - Rerport web api and frontend, moile api',
        description: '',
        priority: 'High',
        status: 'DEPLOYMENT',
        assignees: [{ name: 'KS', avatar: 'KS' }],
        startDate: '9/27/24',
        dueDate: '9/27/24',
        reporter: 'P\'Sao'
    },
    {
        id: '2',
        title: 'T102-Font-ปรับ ปฏิทินให้ Default วันที่ 1/check begin-end-date',
        description: '',
        priority: 'Normal',
        status: 'DEPLOYMENT',
        startDate: '1/10/24',
        dueDate: '1/10/24',
        reporter: 'P\'Sao'
    },
    {
        id: '3',
        title: 'T102-Font-ปรับ ปฏิทินให้ Default วันที่ 1/check begin-end-date',
        description: '',
        priority: 'Normal',
        status: 'DEPLOYMENT',
        startDate: '1/10/24',
        dueDate: '1/10/24',
        reporter: 'P\'Sao'
    },
    {
        id: '4',
        title: 'T102-Font-ปรับ ปฏิทินให้ Default วันที่ 1/check begin-end-date',
        description: '',
        priority: 'Normal',
        status: 'DEPLOYMENT',
        startDate: '1/10/24',
        dueDate: '1/10/24',
        reporter: 'P\'Sao'
    },
    {
        id: '3',
        title: 'T706-Eslip-Site',
        description: '',
        priority: 'Normal',
        status: 'VALIDATE',
        assignees: [
            { name: 'PP', avatar: 'PP' },
            { name: 'KS', avatar: 'KS' },
            { name: 'EA', avatar: 'EA' },
            { name: 'WU', avatar: 'WU' }
        ],
        startDate: '7/1/24',
        dueDate: '8/2/24',
        reporter: 'P\'Sao'
    }
];

interface TaskGroupHeaderProps {
    status: TaskStatus;
    count: number;
    isExpanded: boolean;
    onToggle: (status: TaskStatus) => void;
}

const TaskGroupHeader: React.FC<TaskGroupHeaderProps> = ({ status, count, isExpanded, onToggle }) => {
    return (
        <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onToggle(status)}
        >
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronDown className="w-4 h-4" />
            </motion.div>
            <Badge
                variant="outline"
                className={`${statusColors[status].bg} ${statusColors[status].text} border-none`}
            >
                {status}
            </Badge>
            <span className="text-sm text-gray-500">{count}</span>
            <Button variant="ghost" size="sm" className="ml-2">
                <Plus className="w-4 h-4" />
                Add Task
            </Button>
        </div>
    );
};

interface TaskRowProps {
    task: Task;
}

const TaskRow: React.FC<TaskRowProps> = ({ task }) => {
    return (
        <motion.tr
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>
                {task.assignees ? (
                    <div className="flex -space-x-2">
                        {task.assignees.map((assignee, index) => (
                            <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                <AvatarFallback className="bg-blue-500 text-white text-xs">
                                    {assignee.avatar}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                ) : (
                    <User2 className="w-5 h-5 text-gray-400" />
                )}
            </TableCell>
            <TableCell>{task.startDate}</TableCell>
            <TableCell>{task.dueDate}</TableCell>
            <TableCell>
                <div className="flex items-center space-x-1">
                    <span>{priorityColors[task.priority].icon}</span>
                    <span className={priorityColors[task.priority].color}>
                        {task.priority}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    variant="outline"
                    className={`${statusColors[task.status].bg} ${statusColors[task.status].text} border-none`}
                >
                    {task.status}
                </Badge>
            </TableCell>
            <TableCell>{task.reporter}</TableCell>
            <TableCell>-</TableCell>
            <TableCell>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </TableCell>
        </motion.tr>
    );
};

interface TaskGroupProps {
    status: TaskStatus;
    tasks: Task[];
    isExpanded: boolean;
    onToggle: (status: TaskStatus) => void;
}

const TaskGroup: React.FC<TaskGroupProps> = ({
    status,
    tasks,
    isExpanded,
    onToggle
}) => {
    return (
        <>
            <TableRow className="group">
                <TableCell colSpan={9} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800/50">
                    <TaskGroupHeader
                        status={status}
                        count={tasks.length}
                        isExpanded={isExpanded}
                        onToggle={onToggle}
                    />
                </TableCell>
            </TableRow>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <td colSpan={9} className="p-0">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                            >
                                <Table>
                                    <TableBody>
                                        {tasks.map((task) => (
                                            <TaskRow key={task.id} task={task} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </motion.div>
                        </td>
                    </motion.tr>
                )}
            </AnimatePresence>
        </>
    );
};

const ListView: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [expandedGroups, setExpandedGroups] = useState<TaskStatus[]>(['DEPLOYMENT']);

    const toggleGroup = (status: TaskStatus): void => {
        setExpandedGroups(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const groupedTasks = tasks.reduce((acc, task) => {
        if (!acc[task.status]) {
            acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
    }, {} as Record<TaskStatus, Task[]>);

    return (
        <div className="w-full px-6">
            <div className="border rounded-lg overflow-hidden bg-white dark:bg-[#1a1a1a]">
                <Table className="border-collapse [&_tr:last-child]:border-0">
                    <TableHeader className="bg-white dark:bg-[#1a1a1a] rounded-lg sticky top-0 z-10">
                        <TableRow className="border-b">
                            <TableHead className="w-[35%] min-w-[300px]">Name</TableHead>
                            <TableHead className="w-[12%] min-w-[120px]">Assignee</TableHead>
                            <TableHead className="w-[10%] min-w-[100px]">Start date</TableHead>
                            <TableHead className="w-[10%] min-w-[100px]">Due date</TableHead>
                            <TableHead className="w-[8%] min-w-[90px]">Priority</TableHead>
                            <TableHead className="w-[10%] min-w-[100px]">Status</TableHead>
                            <TableHead className="w-[8%] min-w-[90px]">Reporter</TableHead>
                            <TableHead className="w-[5%] min-w-[60px]">Done</TableHead>
                            <TableHead className="w-[2%] min-w-[40px]" aria-hidden="true" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                            <TaskGroup
                                key={status}
                                status={status as TaskStatus}
                                tasks={statusTasks}
                                isExpanded={expandedGroups.includes(status as TaskStatus)}
                                onToggle={toggleGroup}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ListView;