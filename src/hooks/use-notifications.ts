import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { SSEClient } from '@/lib/sse-client'
import { getTokens } from '@/lib/auth'

export interface Notification {
    id: string
    type: string
    title: string
    content: string
    isRead: boolean
    data?: any
    createdAt: string
}

interface UseNotificationsReturn {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    markAsRead: (notificationId: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    handleAction: (notificationId: string, action: 'accept' | 'reject') => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const sseClientRef = useRef<SSEClient | null>(null)

    // SSE connection
    const connectSSE = useCallback(async () => {
        if (sseClientRef.current?.isConnected()) return

        const sseUrl = `${window.location.origin}/api/notifications/sse`
        
        try {
            sseClientRef.current = new SSEClient(sseUrl, (data: any) => {
                console.log('SSE data received in hook:', data)
                switch (data.type) {
                    case 'UNREAD_COUNT':
                        console.log('Setting unread count to:', data.count)
                        setUnreadCount(data.count)
                        break
                    case 'NOTIFICATIONS':
                        console.log('Setting notifications count:', data.notifications?.length || 0)
                        setNotifications(data.notifications)
                        break
                    case 'NEW_NOTIFICATION':
                        console.log('New notification received:', data.notification.title)
                        setNotifications(prev => {
                            const newNotifications = [data.notification, ...prev]
                            console.log('Updated notifications count:', newNotifications.length)
                            return newNotifications
                        })
                        setUnreadCount(prev => {
                            const newCount = prev + 1
                            console.log('Updating unread count from', prev, 'to', newCount)
                            return newCount
                        })
                        
                        // Show toast for new notification
                        toast(data.notification.title, {
                            description: data.notification.content,
                            action: data.notification.data?.actions ? {
                                label: 'View',
                                onClick: () => {
                                    // Handle view action
                                    console.log('View notification:', data.notification.id)
                                }
                            } : undefined
                        })
                        break
                }
            })

            await sseClientRef.current.connect()
            setIsLoading(false)
        } catch (error) {
            console.error('Failed to connect SSE:', error)
            setIsLoading(false)
        }
    }, [])

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const { accessToken } = getTokens()
            if (!accessToken) {
                console.error('No access token available')
                return
            }

            const response = await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ notificationId })
            })

            if (response.ok) {
                // Optimistic update
                setNotifications(prev => 
                    prev.map(n => 
                        n.id === notificationId ? { ...n, isRead: true } : n
                    )
                )
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }, [])

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            const { accessToken } = getTokens()
            if (!accessToken) {
                console.error('No access token available')
                return
            }

            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })

            if (response.ok) {
                // Optimistic update
                setNotifications(prev => 
                    prev.map(n => ({ ...n, isRead: true }))
                )
                setUnreadCount(0)
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }, [])

    // Handle notification actions (accept/reject)
    const handleAction = useCallback(async (notificationId: string, action: 'accept' | 'reject') => {
        try {
            const { accessToken } = getTokens()
            if (!accessToken) {
                console.error('No access token available')
                return
            }

            const response = await fetch('/api/notifications/actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    notificationId,
                    action
                })
            })

            if (!response.ok) {
                throw new Error('Failed to process action')
            }

            const result = await response.json()
            
            // Mark notification as read after action
            await markAsRead(notificationId)
            
            // Show success message
            toast.success(result.message)
            
            // If accepted invitation, redirect to workspace
            if (action === 'accept' && result.workspaceId) {
                window.location.href = `/workspace/${result.workspaceId}`
            }
        } catch (error) {
            console.error('Error handling notification action:', error)
            toast.error('Failed to process action')
        }
    }, [markAsRead])

    // Initialize SSE connection
    useEffect(() => {
        connectSSE()

        return () => {
            if (sseClientRef.current) {
                sseClientRef.current.disconnect()
            }
        }
    }, [connectSSE])

    // Memoize the return value to prevent unnecessary re-renders
    const result = useMemo(() => ({
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        handleAction
    }), [notifications, unreadCount, isLoading, markAsRead, markAllAsRead, handleAction])

    return result
}
