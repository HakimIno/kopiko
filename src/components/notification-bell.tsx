"use client"

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useNotificationStore } from '@/store/use-notification-store'
import { cn } from '@/lib/utils'


export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const { 
        notifications, 
        unreadCount, 
        isLoading, 
        markAsRead, 
        markAllAsRead, 
        handleAction,
        connectSSE,
        disconnectSSE
    } = useNotificationStore()



    // Initialize SSE connection
    useEffect(() => {
        connectSSE()
        return () => {
            disconnectSSE()
        }
    }, [connectSSE, disconnectSSE])

    const handleNotificationClick = (notificationId: string) => {
        markAsRead(notificationId)
        setIsOpen(false)
    }

    const handleActionClick = async (notificationId: string, action: 'accept' | 'reject') => {
        await handleAction(notificationId, action)
        setIsOpen(false)
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative rounded-xl border-0 hover:bg-accent"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center "
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 mt-2 max-h-96 overflow-y-auto"
                sideOffset={8}
            >
                <div className="p-3 border-b bg-muted/50">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">การแจ้งเตือน</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {unreadCount} ใหม่
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือนใหม่</p>
                    </div>
                ) : (
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start p-3 cursor-pointer hover:bg-accent border-b last:border-b-0",
                                    !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                                )}
                                onClick={() => handleNotificationClick(notification.id)}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2">
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    !notification.isRead && "font-semibold"
                                                )}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {notification.content}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(notification.createdAt).toLocaleString('th-TH', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                
                                                {/* Action buttons for workspace invitations */}
                                                {notification.type === 'WORKSPACE_INVITE' && 
                                                 notification.data?.actions && 
                                                 !notification.isRead && (
                                                    <div className="flex gap-2 mt-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="text-xs h-7 px-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleActionClick(notification.id, 'accept')
                                                            }}
                                                        >
                                                            ยอมรับ
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs h-7 px-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleActionClick(notification.id, 'reject')
                                                            }}
                                                        >
                                                            ปฏิเสธ
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
                
                {notifications.length > 0 && unreadCount > 0 && (
                    <div className="p-2 border-t bg-muted/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs h-8"
                            onClick={() => {
                                markAllAsRead()
                                setIsOpen(false)
                            }}
                        >
                            ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
