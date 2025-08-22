"use client"

import { createContext, useContext, useEffect } from 'react'
import { useNotificationStore } from '@/store/use-notification-store'

interface NotificationContextType {
    unreadCount: number
    isConnected: boolean
}

const NotificationContext = createContext<NotificationContextType>({
    unreadCount: 0,
    isConnected: false
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { unreadCount, isConnected, connectSSE, disconnectSSE } = useNotificationStore()

    useEffect(() => {
        connectSSE()
        return () => {
            disconnectSSE()
        }
    }, [connectSSE, disconnectSSE])

    return (
        <NotificationContext.Provider value={{ unreadCount, isConnected }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotificationContext() {
    return useContext(NotificationContext)
}
