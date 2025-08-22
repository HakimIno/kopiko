import { getTokens, refreshTokens, setTokens } from './auth'

export class WebSocketAuth {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false

  constructor(private url: string, private onMessage: (data: any) => void) {}

  async connect(): Promise<WebSocket> {
    if (this.isConnecting) {
      throw new Error('Connection already in progress')
    }

    this.isConnecting = true

    try {
      // Get current tokens
      const { accessToken, refreshToken } = getTokens()
      
      if (!accessToken && !refreshToken) {
        throw new Error('No authentication tokens available')
      }

      // If no access token but have refresh token, try to refresh
      if (!accessToken && refreshToken) {
        const tokens = await refreshTokens()
        if (!tokens) {
          throw new Error('Failed to refresh authentication')
        }
      }

      // Get fresh tokens after potential refresh
      const { accessToken: freshToken } = getTokens()
      
      if (!freshToken) {
        throw new Error('No access token available after refresh')
      }

      // Create WebSocket with authentication
      const wsUrl = `${this.url}?token=${encodeURIComponent(freshToken)}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected with authentication')
        this.isConnecting = false
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Handle authentication errors
          if (data.type === 'AUTH_ERROR') {
            console.log('WebSocket authentication error, attempting refresh...')
            this.handleAuthError()
            return
          }
          
          this.onMessage(data)
        } catch (error) {
          console.error('WebSocket message parsing error:', error)
        }
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        this.isConnecting = false
        
        // Don't reconnect if it was a normal closure or authentication error
        if (event.code === 1000 || event.code === 1008) {
          return
        }
        
        this.scheduleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnecting = false
      }

      return this.ws
    } catch (error) {
      this.isConnecting = false
      throw error
    }
  }

  private async handleAuthError() {
    try {
      // Try to refresh tokens
      const tokens = await refreshTokens()
      if (tokens) {
        // Reconnect with new token
        if (this.ws) {
          this.ws.close()
        }
        await this.connect()
      } else {
        // Refresh failed, redirect to login
        window.location.href = '/sign-in'
      }
    } catch (error) {
      console.error('Failed to handle auth error:', error)
      window.location.href = '/sign-in'
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    setTimeout(async () => {
      try {
        await this.connect()
      } catch (error) {
        console.error('Reconnection failed:', error)
        this.scheduleReconnect()
      }
    }, delay)
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect')
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
