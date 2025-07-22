import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Edit2, Trash2, Clock } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "./progressBar";
import Image from "next/image";

interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'ON_HOLD';
    key: string;
    isPublic: boolean;
    icon?: string;
    backgroundColor?: string;
    workspaceId?: string;
  }
  

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (projectId: string) => void;
    isLoading: {
        update: boolean;
        delete: boolean;
    };
}

export function ProjectCard({ project, onEdit, onDelete, isLoading }: ProjectCardProps) {
    const mainColor = project.backgroundColor || '#B07A57';

    return (
        <Link href={`/workspace/${project.workspaceId}/project/${project.id}`}>
            <Card className="group relative overflow-hidden backdrop-blur-sm border-none p-4 hover:shadow-xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white dark:from-[#1a1a1a] to-white/80 dark:to-[#1a1a1a]/80">
                {/* Decorative Elements */}
                <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-500"
                    style={{ backgroundColor: mainColor }}
                />
                <div
                    className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-500"
                    style={{ backgroundColor: mainColor }}
                />
                <div
                    className="absolute top-0 left-0 w-1 h-full group-hover:h-full transition-all duration-500"
                    style={{ backgroundColor: mainColor }}
                />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                                style={{
                                    background: `linear-gradient(135deg, ${mainColor}20, ${mainColor}40)`,
                                    boxShadow: `0 4px 12px ${mainColor}15`
                                }}
                            >
                                {project.icon ? <Image src={project.icon} alt={project.icon} width={24} height={24} /> : <FolderKanban
                                    className="w-5 h-5 transition-transform duration-500 group-hover:-rotate-6"
                                    style={{ color: mainColor }}
                                />}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-semibold text-base group-hover:text-lg transition-all duration-300">
                                    {project.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full transition-colors duration-300"
                                        style={{
                                            backgroundColor: `${mainColor}15`,
                                            color: mainColor
                                        }}
                                    >
                                        {project.key}
                                    </span>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3 mr-1" />
                                        2h ago
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                            onClick={(e) => e.preventDefault()}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(project)}
                                disabled={isLoading.update}
                                className="h-8 w-8 p-0  rounded-xl"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(project.id)}
                                disabled={isLoading.delete}
                                className="h-8 w-8 p-0 rounded-xl text-white hover:bg-none"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Description with gradient fade */}
                    {project.description && (
                        <div className="relative">
                            <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                                {project.description}
                            </p>
                            <div
                                className="absolute bottom-0 left-0 right-0 h-6  group-hover:opacity-0 transition-opacity duration-500"
                            />
                        </div>
                    )}

                    {/* Progress Bar */}
                    <ProgressBar
                        mainColor={mainColor}
                        progress={30} // คุณสามารถส่งค่า progress ที่ต้องการได้
                    />

                    {/* Tags/Status */}
                    <div className="flex gap-2 mt-3">
                        <span
                            className="text-xs px-2 py-0.5 rounded-full transition-colors duration-300"
                            style={{
                                backgroundColor: `${mainColor}10`,
                                color: mainColor
                            }}
                        >
                            8 tasks
                        </span>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full transition-colors duration-300"
                            style={{
                                backgroundColor: `${mainColor}10`,
                                color: mainColor
                            }}
                        >
                            3 members
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}