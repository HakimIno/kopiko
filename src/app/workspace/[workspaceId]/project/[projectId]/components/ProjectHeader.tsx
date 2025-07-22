'use client';

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button"
import { Project } from "@/hooks/use-project";
import { Calendar, Users, Filter, Plus, ArrowLeft } from 'lucide-react';
import Image from "next/image";
import { useRouter } from "next/navigation";


interface ProjectHeaderProps {
    currentView: 'sprint' | 'kanban' | 'calendar';
    onViewChange: (view: 'sprint' | 'kanban' | 'calendar') => void;
    project: Project
}

export default function ProjectHeader({
    currentView,
    onViewChange,
    project
}: ProjectHeaderProps) {
    const router = useRouter();
    return (
        <div className="bg-blackgroud space-y-3 px-8 py-3">
            {/* Project Title and Edit */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="p-4 bg-background rounded-full text-[#B07A57]"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-full w-full" />
                    </Button>
                    <div
                        className="text-white rounded-lg w-8 h-8 flex items-center justify-center"
                        style={{ backgroundColor: project.backgroundColor ?? "#B07A57" }}
                    >
                        {project.icon ? <Image
                            src={project.icon}
                            alt={project.name}
                            width={24}
                            height={24}
                        /> : <span className="text-lg font-semibold">{project.name.slice(0, 1)}</span>}

                    </div>
                    <h1 className="text-xl font-semibold">{project.name} ({project.workspace.name})</h1>
                </div>
                {/* <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    <span className="flex items-center">
                        <span className="mr-2">Edit Project</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.22541 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                    </span>
                </Button> */}
            </div>

            {/* View Tabs and Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                    {/* View Tabs */}
                    <div className="flex rounded-lg bg-background space-x-2">
                        <Button
                            variant={currentView === 'sprint' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={`${currentView === 'sprint' ? 'bg-white dark:bg-[#1a1a1a] shadow-sm' : 'hover:bg-white hover:dark:bg-[#1a1a1a]'} rounded-lg px-3 py-1`}
                            onClick={() => onViewChange('sprint')}
                        >
                            Sprint
                        </Button>
                        <Button
                            variant={currentView === 'kanban' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={`${currentView === 'kanban' ? 'bg-white dark:bg-[#1a1a1a] shadow-sm' : 'hover:bg-white hover:dark:bg-[#1a1a1a]'} rounded-lg px-3 py-1`}
                            onClick={() => onViewChange('kanban')}
                        >
                            Kanban
                        </Button>
                        <Button
                            variant={currentView === 'calendar' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={`${currentView === 'calendar' ? 'bg-white dark:bg-[#1a1a1a] shadow-sm' : 'hover:bg-white hover:dark:bg-[#1a1a1a]'} rounded-lg px-3 py-1`}
                            onClick={() => onViewChange('calendar')}
                        >
                            Calendar
                        </Button>

                    </div>
                </div>

                <Button size="sm" className="bg-[#B07A57] hover:bg-[#B07A57]/60">
                    <Plus className="mr-2 h-4 w-4" />
                    New
                </Button>
            </div>
            <DottedSeparator />
            {/* Filters Row */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Button variant="outline" size="sm" className="h-8 bg-blackgroud">
                    <Filter className="mr-2 h-4 w-4" />
                    All statuses
                </Button>
                <Button variant="outline" size="sm" className="h-8 bg-blackgroud">
                    <Users className="mr-2 h-4 w-4" />
                    All assignees
                </Button>
                <Button variant="outline" size="sm" className="h-8 bg-blackgroud">
                    <Filter className="mr-2 h-4 w-4" />
                    All projects
                </Button>
                <Button variant="outline" size="sm" className="h-8 bg-blackgroud">
                    <Calendar className="mr-2 h-4 w-4" />
                    Due date
                </Button>
            </div>
            <DottedSeparator />

        </div>
    );
}