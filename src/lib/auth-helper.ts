import { getTokens, refreshTokens } from './auth'
import { tokenManager } from './token-manager'

export async function getValidToken(): Promise<string | null> {
    try {
        let { accessToken } = getTokens()
        
        if (!accessToken) {
            // Try to refresh token
            const tokens = await refreshTokens()
            if (tokens) {
                accessToken = tokens.accessToken
                    } else {
            return null
        }
        }
        
        return accessToken
    } catch (error) {
        return null
    }
}

export async function makeAuthenticatedRequest(
    url: string, 
    options: RequestInit = {}
): Promise<Response> {
    let accessToken = await getValidToken()
    if (!accessToken) {
        throw new Error('No valid token available')
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            ...options.headers,
        },
    })

    if (response.status === 401) {
        // Token expired, try to refresh and retry
        const tokens = await tokenManager.forceRefresh()
        if (tokens) {
            const retryResponse = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens.accessToken}`,
                    ...options.headers,
                },
            })
            return retryResponse
        } else {
            throw new Error('Failed to refresh token')
        }
    }

    return response
}
