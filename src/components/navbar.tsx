import Image from "next/image"
import { Button } from "./ui/button"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Bell } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileSidebar } from "./mobile-sidebar"
import { useSidebar } from "@/store/use-sidebar"
import { cn } from "@/lib/utils"
import { NotificationBell } from "./notification-bell"

export const Navbar = () => {
    const router = useRouter()
    const { isCollapsed } = useSidebar()

    const handleLogout = async () => {
        await logout()
        router.push('/sign-in')
    }

    return (
        <nav className="fixed top-0 z-50 w-full shadow-sm font-anuphan">
            <div className="flex h-16 items-center px-4">
                <MobileSidebar />
                <div className="flex items-center gap-2 md:gap-4">
                    <div className={cn(
                        "hidden md:flex items-center gap-2 transition-all duration-300",
                        isCollapsed ? "w-auto" : "w-56"
                    )}>
                        {!isCollapsed ? (
                            <span className="text-2xl font-semibold ml-2">
                                Kopiko
                            </span>
                        ) : (
                            <span className="text-2xl font-semibold ml-2">
                                K
                            </span>
                        )}
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                    
                    {/* Notification Bell */}
                    <NotificationBell />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="relative rounded-xl border-0"
                            >
                                <User className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 mt-2"
                        >
                            <DropdownMenuItem onClick={() => router.push('/change-password')}>
                                Change Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-red-600 dark:text-red-400"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
} 