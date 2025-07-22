"use client"

import { cn } from "@/lib/utils"
import { Home, Coffee, Settings, ShoppingCart, ChevronLeft, Briefcase } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/store/use-sidebar"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "./ui/select"
import { DottedSeparator } from "./dotted-separator"
import { CreateWorkspaceButton } from "@/components/workspace/create-workspace-button"
import { useEffect, useState } from "react"
import { fetchWithAuth } from "@/lib/auth"
import { toast } from "sonner"
import Image from "next/image"

const routes = [
    {
        label: 'Dashboard',
        icon: Home,
        href: '/dashboard',
    },
    {
        label: 'โปรเจค',
        icon: Briefcase,
        href: '/dashboard/projects',
    },
    {
        label: 'งาน',
        icon: Coffee,
        href: '/dashboard/tasks',
    },
    {
        label: 'รายงาน',
        icon: ShoppingCart,
        href: '/dashboard/reports',
    },
    {
        label: 'ทีม',
        icon: Settings,
        href: '/dashboard/team',
    },
    {
        label: 'ตั้งค่า',
        icon: Settings,
        href: '/dashboard/settings',
    },
]

interface NavLinksProps {
    isMobile?: boolean
}

interface Workspace {
    id: string
    name: string
    icon?: string
    theme?: {
        color: string
    }
}

export const NavLinks = ({ isMobile }: NavLinksProps) => {
    const pathname = usePathname()
    const { isCollapsed, toggleCollapse } = useSidebar()
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [selectedWorkspace, setSelectedWorkspace] = useState<string>()

    useEffect(() => {
        async function fetchWorkspaces() {
            try {
                const response = await fetchWithAuth("/api/workspaces")
                if (!response.ok) {
                    throw new Error("Failed to fetch workspaces")
                }
                const data = await response.json()
                setWorkspaces(data)
            } catch (error) {
                console.error(error)
                toast.error("Failed to load workspaces")
            }
        }

        fetchWorkspaces()
    }, [])

    return (
        <div className="flex h-full flex-col shadow-lg">
            {!isMobile && (
                <div className="px-2 py-3">
                    {/* Workspace Selector */}
                    <div className="flex flex-col gap-2 justify-center">
                        <div className="flex items-center justify-between">
                            {!isCollapsed && <span className="text-xs font-medium text-muted-foreground">WORKSPACES</span>}
                            <div className="flex items-center">
                                {!isCollapsed && <CreateWorkspaceButton variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted rounded-full" />}

                                <Button
                                    onClick={toggleCollapse}
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-muted px-5 rounded-full ml-1"
                                >
                                    <ChevronLeft
                                        className={cn(
                                            "h-5 w-5 transition-all duration-300",
                                            isCollapsed && "rotate-180"
                                        )}
                                    />
                                </Button>
                            </div>
                        </div>

                        <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                            <SelectTrigger
                                className={cn(
                                    "border-none dark:bg-[#1a1a1a]/80 items-center flex dark:text-[#B07A57] ml-1 px-2",
                                    isCollapsed ? "w-10 px-2" : "w-full"
                                )}
                                isIcon={!isCollapsed}
                            >
                                <SelectValue placeholder={
                                    isCollapsed ? (
                                        <Briefcase className="h-5 w-5 ml-0.5" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            <span>Select workspace</span>
                                        </div>
                                    )
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {workspaces.map((workspace) => (
                                        <SelectItem key={workspace.id} value={workspace.id}>
                                            <div className="flex items-center gap-3">
                                                {workspace.icon ? (
                                                    <div className="p-2 rounded-lg " style={{ backgroundColor: workspace.theme?.color || "#4F46E5" }}>
                                                        <Image
                                                            src={workspace.icon}
                                                            alt={workspace.name}
                                                            width={14}
                                                            height={14}
                                                            className="w-4 h-4 rounded object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="w-4 h-4 rounded flex items-center justify-center text-white text-xs font-semibold"
                                                        style={{ backgroundColor: workspace.theme?.color || "#4F46E5" }}
                                                    >
                                                        {workspace.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span>{workspace.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                                <div className="flex items-center w-full mt-2">
                                    <CreateWorkspaceButton className="w-full" />
                                </div>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <div className="px-3">
                <DottedSeparator dotSize="2px" gapSize="2px" />
            </div>

            <ScrollArea className="flex-1">
                <div className={cn(
                    "flex flex-col gap-2 p-2",
                    isMobile && "mt-4"
                )}>
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center gap-3  dark:bg-[#1a1a1a]/80 text-[#1a1a1a] dark:text-[#B07A57]  rounded-lg px-3 py-2.5 text-sm hover:bg-[#B07A57]/30 ",
                                pathname === route.href ? "bg-[#B07A57]/30 font-medium" : "",
                                !isMobile && isCollapsed ? "justify-center" : ""
                            )}
                        >
                            <route.icon className={cn(
                                "h-5 w-5 ",
                                !isMobile && isCollapsed ? "w-5" : "w-5"
                            )} />
                            {(isMobile || !isCollapsed) && (
                                <span className="">{route.label}</span>
                            )}
                        </Link>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
} 