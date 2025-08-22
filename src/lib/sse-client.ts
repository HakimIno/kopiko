import { getTokens, refreshTokens } from './auth'

export class SSEClient {
    private eventSource: EventSource | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000
    private isConnecting = false
    private keepAliveTimeout: NodeJS.Timeout | null = null

    constructor(private url: string, private onMessage: (data: any) => void) {}

    async connect(): Promise<EventSource> {
        if (this.isConnecting) {
            throw new Error('Connection already in progress')
        }

        this.isConnecting = true

        try {
            // Get current tokens
            let { accessToken, refreshToken } = getTokens()
            
            if (!accessToken && !refreshToken) {
                throw new Error('No authentication tokens available')
            }

            // If no access token but have refresh token, try to refresh
            if (!accessToken && refreshToken) {
                const tokens = await refreshTokens()
                if (!tokens) {
                    throw new Error('Failed to refresh authentication')
                }
                accessToken = tokens.accessToken
            }

            // Verify token is not expired by checking if it exists
            if (!accessToken) {
                throw new Error('No access token available after refresh')
            }

            // Create SSE connection with authentication
            const sseUrl = `${this.url}?token=${encodeURIComponent(accessToken)}`
            this.eventSource = new EventSource(sseUrl)

            this.eventSource.onopen = () => {
                this.isConnecting = false
                this.reconnectAttempts = 0
                this.startKeepAlive()
            }

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    
                    // Handle keep-alive
                    if (data.type === 'KEEP_ALIVE') {
                        this.resetKeepAlive()
                        return
                    }
                    
                    this.onMessage(data)
                } catch (error) {
                    // Handle parsing error silently
                }
            }

            this.eventSource.onerror = (error) => {
                this.isConnecting = false
                this.stopKeepAlive()
                
                // Close current connection
                if (this.eventSource) {
                    this.eventSource.close()
                    this.eventSource = null
                }
                
                // Check if it's a token expired error (401)
                // For SSE, we can't easily check status code, so we'll try to refresh token
                this.handleTokenExpired()
            }

            return this.eventSource
        } catch (error) {
            this.isConnecting = false
            throw error
        }
    }

    private startKeepAlive() {
        this.keepAliveTimeout = setTimeout(() => {
            this.reconnect()
        }, 35000) // 35 seconds (slightly longer than server's 30s keep-alive)
    }

    private resetKeepAlive() {
        if (this.keepAliveTimeout) {
            clearTimeout(this.keepAliveTimeout)
        }
        this.startKeepAlive()
    }

    private stopKeepAlive() {
        if (this.keepAliveTimeout) {
            clearTimeout(this.keepAliveTimeout)
            this.keepAliveTimeout = null
        }
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            return
        }

        this.reconnectAttempts++
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
        
        setTimeout(async () => {
            try {
                await this.connect()
            } catch (error) {
                this.scheduleReconnect()
            }
        }, delay)
    }

    private async handleTokenExpired() {
        try {
            // Try to refresh token
            const tokens = await refreshTokens()
            if (tokens) {
                // Reconnect with new token
                await this.connect()
            } else {
                // Refresh failed, redirect to login
                window.location.href = '/sign-in'
            }
        } catch (error) {
            // Refresh failed, redirect to login
            window.location.href = '/sign-in'
        }
    }

    private async reconnect() {
        try {
            if (this.eventSource) {
                this.eventSource.close()
                this.eventSource = null
            }
            await this.connect()
        } catch (error) {
            this.scheduleReconnect()
        }
    }

    send(data: any) {
        // SSE is one-way from server to client
        // For client-to-server communication, use regular HTTP requests
    }

    disconnect() {
        this.stopKeepAlive()
        if (this.eventSource) {
            this.eventSource.close()
            this.eventSource = null
        }
    }

    isConnected(): boolean {
        return this.eventSource?.readyState === EventSource.OPEN
    }
}
