import { create } from 'zustand'
import { Member } from '@/types'

interface AuthStore {
  member: Member | null
  isLoading: boolean
  setMember: (member: Member | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  member: null,
  isLoading: true,

  setMember: (member) => set({ member }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      set({ member: null })
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true })
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        set({ member: data.member })
      } else {
        set({ member: null })
      }
    } catch {
      set({ member: null })
    } finally {
      set({ isLoading: false })
    }
  },
}))
