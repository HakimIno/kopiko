"use client";

import { Navbar } from "@/components/navbar";
import { NavLinks } from "@/components/nav-links";
import { useSidebar } from "@/store/use-sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex h-[calc(100vh-4rem)] pt-16">
                <aside className={cn(
                    "hidden shadow-lg transition-all duration-300 md:block fixed z-[49] h-[calc(100vh-4rem)]",
                    isCollapsed ? "w-16" : "w-64"
                )}>
                    <NavLinks />
                </aside>
                <main className={cn(
                    "flex-1 overflow-y-auto",
                    isCollapsed ? "md:pl-16" : "md:pl-64"
                )}>
                    <div className="mx-auto max-w-full px-4 py-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
