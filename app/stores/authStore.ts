'use client'

import { create } from 'zustand'

interface AuthState {
  token: string | null
  refreshToken: string | null
  username: string | null
  setAuth: (auth: { token: string; refreshToken?: string; username: string }) => void
  logout: () => void
  refreshAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set, get) => {
  let initialToken: string | null = null
  let initialRefreshToken: string | null = null
  let initialUsername: string | null = null

  if (typeof window !== 'undefined') {
    initialToken = localStorage.getItem('token')
    initialRefreshToken = localStorage.getItem('refreshToken')
    initialUsername = localStorage.getItem('username')
  }

  return {
    token: initialToken,
    refreshToken: initialRefreshToken,
    username: initialUsername,

    setAuth: ({ token, refreshToken, username }) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('username', username)
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      }
      set({
        token,
        refreshToken: refreshToken ?? get().refreshToken,
        username,
      })
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('username')
      }
      set({ token: null, refreshToken: null, username: null })
    },

    refreshAuth: async () => {
      const refreshToken = get().refreshToken
      if (!refreshToken) return false

      try {
        
        const res = await fetch('/api/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (!res.ok) throw new Error('Failed to refresh token')
        const data = await res.json()

        get().setAuth({
          token: data.token,
          refreshToken: data.refreshToken,
          username: get().username!,
        })
        return true
      } catch (e) {
        console.error('Token refresh failed', e)
        get().logout()
        return false
      }
    },
  }
})
