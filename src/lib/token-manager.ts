import { getTokens, refreshTokens } from './auth'

class TokenManager {
    private refreshInterval: NodeJS.Timeout | null = null
    private isRefreshing = false

    startAutoRefresh() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval)
        }

        // Refresh token every 10 minutes (600 seconds)
        this.refreshInterval = setInterval(async () => {
            await this.refreshTokenIfNeeded()
        }, 10 * 60 * 1000)
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval)
            this.refreshInterval = null
        }
    }

    private async refreshTokenIfNeeded() {
        if (this.isRefreshing) return

        try {
            this.isRefreshing = true
            const { accessToken, refreshToken } = getTokens()
            
            if (!accessToken && refreshToken) {
                await refreshTokens()
            }
        } catch (error) {
            // Handle error silently
        } finally {
            this.isRefreshing = false
        }
    }

    async forceRefresh() {
        try {
            this.isRefreshing = true
            const tokens = await refreshTokens()
            return tokens
        } catch (error) {
            return null
        } finally {
            this.isRefreshing = false
        }
    }
}

export const tokenManager = new TokenManager()
