'use client';

import React, { useState } from 'react';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Task {
    id: string;
    title: string;
    status: string;
    priority: 'High' | 'Normal' | 'Low';
    dueDate: string;
    assignees?: { name: string; avatar: string; }[];
}

interface CalendarDayProps {
    date: Date;
    isCurrentMonth: boolean;
    tasks: Task[];
    isSelected: boolean;
    onSelect: (date: Date) => void;
}

const priorityColors = {
    High: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Normal: 'bg-blue-100 text-blue-800 border-blue-200',
    Low: 'bg-green-100 text-green-800 border-green-200'
};

const CalendarDay: React.FC<CalendarDayProps> = ({ date, isCurrentMonth, tasks, isSelected, onSelect }) => {
    const dayTasks = tasks.filter(task => isSameDay(new Date(task.dueDate), date));
    const isTodays = isToday(date);

    return (
        <motion.div
            className={`min-h-[120px] p-2 ${isCurrentMonth ? 'bg-[#F6F4EE] dark:bg-[#2B2B29] ' : ' bg-neutral-50 dark:bg-[#1a1a1a]'} rounded-md cursor-pointer
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => onSelect(date)}
            whileHover={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-gray-400' :
                    isTodays ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                    }`}>
                    {format(date, 'd')}
                </span>
                {isCurrentMonth && (
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="space-y-1">
                {dayTasks.map((task) => (
                    <motion.div
                        key={task.id}
                        className={`p-1.5 rounded-md text-xs ${priorityColors[task.priority]} cursor-pointer`}
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="font-medium truncate">{task.title}</div>
                        {task.assignees && task.assignees.length > 0 && (
                            <div className="flex -space-x-1 mt-1">
                                {task.assignees.map((assignee, idx) => (
                                    <Avatar key={idx} className="h-4 w-4 border border-white">
                                        <AvatarFallback className="text-[8px]">
                                            {assignee.avatar}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [view, setView] = useState<'month' | 'week'>('month');

    // Sample tasks data
    const tasks: Task[] = [
        {
            id: '1',
            title: 'Design Review',
            status: 'IN_PROGRESS',
            priority: 'High',
            dueDate: '2024-01-20',
            assignees: [
                { name: 'John', avatar: 'JD' },
                { name: 'Alice', avatar: 'AC' }
            ]
        },
        // Add more tasks as needed
    ];

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days to start from Sunday
    const startPadding = monthStart.getDay();
    const endPadding = 6 - monthEnd.getDay();

    const allDays = [
        ...Array(startPadding).fill(null).map((_, i) => addDays(monthStart, -startPadding + i)),
        ...calendarDays,
        ...Array(endPadding).fill(null).map((_, i) => addDays(monthEnd, i + 1))
    ];

    const weeks = Array(Math.ceil(allDays.length / 7)).fill(null).map((_, i) =>
        allDays.slice(i * 7, (i + 1) * 7)
    );

    return (
        <div className="px-6 h-full bg-blackgroud">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentDate(addDays(currentDate, -30))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentDate(addDays(currentDate, 30))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(new Date())}
                        >
                            Today
                        </Button>
                        <Select
                            value={view}
                            onValueChange={(value: 'month' | 'week') => setView(value)}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Month</SelectItem>
                                <SelectItem value="week">Week</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-blackground rounded-lg overflow-hidden">
                    {/* Week day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div
                            key={day}
                            className="bg-blackground py-2 text-center text-sm font-medium text-gray-500"
                        >
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    <AnimatePresence mode="wait">
                        {weeks.map((week, weekIndex) => (
                            <React.Fragment key={weekIndex}>
                                {week.map((date, dayIndex) => (
                                    <CalendarDay
                                        key={dayIndex}
                                        date={date}
                                        isCurrentMonth={isSameMonth(date, currentDate)}
                                        tasks={tasks}
                                        isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
                                        onSelect={setSelectedDate}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}