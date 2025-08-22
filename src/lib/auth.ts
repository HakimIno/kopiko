import Cookies from 'js-cookie'

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export const setTokens = (tokens: TokenResponse) => {
  // Set tokens in both localStorage and cookies
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
  
  // Set cookies with 7 days expiry
  Cookies.set('accessToken', tokens.accessToken, { path: '/', expires: 7 })
  Cookies.set('refreshToken', tokens.refreshToken, { path: '/', expires: 7 })
}

export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  }
}

export const clearTokens = () => {
  // Clear localStorage
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  
  // Clear cookies
  Cookies.remove('accessToken', { path: '/' })
  Cookies.remove('refreshToken', { path: '/' })
}

export const logout = async () => {
  try {
    const { accessToken } = getTokens()
    if (!accessToken) return

    // Call logout API to invalidate refresh token
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  } finally {
    clearTokens()
  }
}

export const refreshTokens = async (): Promise<TokenResponse | null> => {
  try {
    const { refreshToken } = getTokens()
    if (!refreshToken) return null

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      clearTokens()
      return null
    }

    const tokens = await response.json()
    setTokens(tokens)
    return tokens
  } catch {
    clearTokens()
    return null
  }
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let { accessToken } = getTokens()

  if (!accessToken) {
    const tokens = await refreshTokens()
    if (!tokens) {
      throw new Error('Not authenticated')
    }
    accessToken = tokens.accessToken
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  // If token expired, try to refresh and retry the request
  if (response.status === 401) {
    try {
      const errorData = await response.json()
      
      // Check if it's a token expired error
      if (errorData.code === 'TOKEN_EXPIRED') {
        const tokens = await refreshTokens()
        if (!tokens) {
          throw new Error('Not authenticated')
        }

        // Retry the request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
        })
      }
    } catch (parseError) {
      // If we can't parse the error response, try refreshing anyway
      const tokens = await refreshTokens()
      if (!tokens) {
        throw new Error('Not authenticated')
      }

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      })
    }
  }

  return response
} 