import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('medi_user') || 'null'),
  token: localStorage.getItem('medi_access_token') || null,
  refreshToken: localStorage.getItem('medi_refresh_token') || null,

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('medi_user', JSON.stringify(user))
    localStorage.setItem('medi_access_token', token)
    localStorage.setItem('medi_refresh_token', refreshToken)
    set({ user, token, refreshToken })
  },

  updateUser: (updatedUser) => {
    const newUser = { ...get().user, ...updatedUser }
    localStorage.setItem('medi_user', JSON.stringify(newUser))
    set({ user: newUser })
  },

  logout: () => {
    localStorage.removeItem('medi_user')
    localStorage.removeItem('medi_access_token')
    localStorage.removeItem('medi_refresh_token')
    set({ user: null, token: null, refreshToken: null })
  },

  isAuthenticated: () => !!get().token,
  role: () => get().user?.role || 'guest',
}))
