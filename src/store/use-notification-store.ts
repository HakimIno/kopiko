import { create } from 'zustand'
import { toast } from 'sonner'
import { SSEClient } from '@/lib/sse-client'
import { makeAuthenticatedRequest } from '@/lib/auth-helper'
import { tokenManager } from '@/lib/token-manager'

export interface Notification {
    id: string
    type: string
    title: string
    content: string
    isRead: boolean
    data?: any
    createdAt: string
}

interface NotificationState {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    isConnected: boolean
    sseClient: SSEClient | null
    
    // Actions
    setNotifications: (notifications: Notification[]) => void
    addNotification: (notification: Notification) => void
    markAsRead: (notificationId: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    handleAction: (notificationId: string, action: 'accept' | 'reject') => Promise<void>
    setUnreadCount: (count: number) => void
    setLoading: (loading: boolean) => void
    setConnected: (connected: boolean) => void
    
    // SSE Connection
    connectSSE: () => Promise<void>
    disconnectSSE: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    isConnected: false,
    sseClient: null,

    setNotifications: (notifications) => set({ notifications }),
    
    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }))
        
        // Show toast for new notification
        toast(notification.title, {
            description: notification.content,
            action: notification.data?.actions ? {
                label: 'View',
                onClick: () => {
                    // Handle view action
                }
            } : undefined
        })
    },

    markAsRead: async (notificationId) => {
        try {
            const response = await makeAuthenticatedRequest('/api/notifications/mark-read', {
                method: 'POST',
                body: JSON.stringify({ notificationId })
            })

            if (response.ok) {
                set((state) => ({
                    notifications: state.notifications.map(n => 
                        n.id === notificationId ? { ...n, isRead: true } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }))
            }
        } catch (error) {
            // Handle error silently
        }
    },

    markAllAsRead: async () => {
        try {
            const response = await makeAuthenticatedRequest('/api/notifications/mark-all-read', {
                method: 'POST'
            })

            if (response.ok) {
                set((state) => ({
                    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                    unreadCount: 0
                }))
            }
        } catch (error) {
            // Handle error silently
        }
    },

    handleAction: async (notificationId, action) => {
        try {
            const response = await makeAuthenticatedRequest('/api/notifications/actions', {
                method: 'POST',
                body: JSON.stringify({
                    notificationId,
                    action
                })
            })

            if (response.ok) {
                const result = await response.json()
                
                // Mark notification as read after action
                await get().markAsRead(notificationId)
                
                // Show success message
                toast.success(result.message)
                
                // If accepted invitation, redirect to workspace
                if (action === 'accept' && result.workspaceId) {
                    window.location.href = `/workspace/${result.workspaceId}`
                }
            } else {
                throw new Error('Failed to process action')
            }
        } catch (error) {
            toast.error('Failed to process action')
        }
    },

    setUnreadCount: (count) => set({ unreadCount: count }),
    setLoading: (loading) => set({ isLoading: loading }),
    setConnected: (connected) => set({ isConnected: connected }),

    connectSSE: async () => {
        const state = get()
        if (state.sseClient?.isConnected()) return

        const sseUrl = `${window.location.origin}/api/notifications/sse`
        
        try {
            const sseClient = new SSEClient(sseUrl, (data: any) => {
                switch (data.type) {
                    case 'UNREAD_COUNT':
                        get().setUnreadCount(data.count)
                        break
                    case 'NOTIFICATIONS':
                        get().setNotifications(data.notifications)
                        break
                    case 'NEW_NOTIFICATION':
                        get().addNotification(data.notification)
                        break
                }
            })

            await sseClient.connect()
            set({ sseClient, isConnected: true, isLoading: false })
            
            // Start auto-refresh token
            tokenManager.startAutoRefresh()
        } catch (error) {
            set({ isConnected: false, isLoading: false })
            
            // If connection fails, try to reconnect after a delay
            setTimeout(() => {
                const state = get()
                if (!state.isConnected) {
                    state.connectSSE()
                }
            }, 5000)
        }
    },

    disconnectSSE: () => {
        const state = get()
        if (state.sseClient) {
            state.sseClient.disconnect()
            set({ sseClient: null, isConnected: false })
        }
        
        // Stop auto-refresh token
        tokenManager.stopAutoRefresh()
    }
}))
