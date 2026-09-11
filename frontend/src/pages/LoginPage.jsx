import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import api from '../services/api'
import { Activity, Lock, Mail, UserCheck, Shield, Stethoscope, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e, demoEmail = null, demoPassword = null) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)

    const loginEmail = demoEmail || email
    const loginPassword = demoPassword || password

    try {
      const res = await api.post('/auth/login/', {
        email: loginEmail,
        password: loginPassword,
      })
      const { user, token, refresh_token } = res.data
      setAuth(user, token, refresh_token)

      if (user.role === 'admin') navigate('/admin-dashboard')
      else if (user.role === 'doctor') navigate('/doctor-dashboard')
      else navigate('/patient-dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Invalid login credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-200">
          <Activity className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign in to <span className="text-purple-600">MediAI</span>
        </h2>
        <p className="text-sm text-slate-600">Access your role-based telehealth workspace</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-purple-900/5 rounded-3xl border border-purple-100 sm:px-10">
          
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={(e) => handleLogin(e)}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-200 transition-all hover:shadow-purple-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              ⚡ 1-Click Instant Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLogin(null, 'patient@mediai.com', 'patient123')}
                className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-center text-xs font-bold text-purple-700 transition-colors"
              >
                <UserCheck className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'doctor@mediai.com', 'doctor123')}
                className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-center text-xs font-bold text-purple-700 transition-colors"
              >
                <Stethoscope className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                Doctor
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'admin@mediai.com', 'admin123')}
                className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-center text-xs font-bold text-purple-700 transition-colors"
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-purple-600 hover:text-purple-800">
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
