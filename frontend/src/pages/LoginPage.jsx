import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import api from '../services/api'
import { 
  Activity, Lock, Mail, UserCheck, Shield, Stethoscope, ArrowRight, 
  KeyRound, X, CheckCircle2, Clock, RotateCcw, Sparkles, ShieldCheck,
  AlertCircle
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Unverified Email Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyOtp, setVerifyOtp] = useState(['', '', '', '', '', ''])
  const [verifyDevOtp, setVerifyDevOtp] = useState(null)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) // 1 = enter email, 2 = enter OTP + new password
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotDevOtp, setForgotDevOtp] = useState(null)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e, demoEmail = null, demoPassword = null) => {
    if (e) e.preventDefault()
    setError('')
    setSuccessMessage('')
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
      const errData = err.response?.data
      if (errData?.requires_verification) {
        setVerifyEmail(errData.email)
        setVerifyDevOtp(errData.dev_otp)
        setShowVerifyModal(true)
        setVerifyError(errData.message || 'Please verify your email address to log in.')
      } else {
        setError(errData?.error || errData?.detail || 'Invalid email or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP digit entry in unverified modal
  const handleVerifyOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const next = [...verifyOtp]
    next[index] = value.slice(-1)
    setVerifyOtp(next)
    if (value && index < 5) {
      const nextInput = document.getElementById(`verify-otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault()
    const code = verifyOtp.join('')
    if (code.length !== 6) {
      setVerifyError('Please enter the full 6-digit code.')
      return
    }

    setVerifyError('')
    setVerifyLoading(true)

    try {
      const res = await api.post('/auth/verify-otp/', {
        email: verifyEmail,
        otp: code,
        purpose: 'registration'
      })

      const { user, token, refresh_token } = res.data
      setAuth(user, token, refresh_token)
      setShowVerifyModal(false)

      if (user.role === 'admin') navigate('/admin-dashboard')
      else if (user.role === 'doctor') navigate('/doctor-dashboard')
      else navigate('/patient-dashboard')
    } catch (err) {
      const errData = err.response?.data
      setVerifyError(errData?.otp?.[0] || 'Verification code is invalid or expired.')
    } finally {
      setVerifyLoading(false)
    }
  }

  // Forgot Password: Step 1 (Request OTP)
  const handleForgotRequestOtp = async (e) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotError('')
    setForgotLoading(true)

    try {
      const res = await api.post('/auth/forgot-password/', { email: forgotEmail })
      if (res.data?.dev_otp) {
        setForgotDevOtp(res.data.dev_otp)
      }
      setForgotStep(2)
    } catch (err) {
      const errData = err.response?.data
      setForgotError(errData?.email?.[0] || 'No registered account found with this email.')
    } finally {
      setForgotLoading(false)
    }
  }

  // Forgot Password: Step 2 (Reset Password)
  const handleForgotResetPassword = async (e) => {
    e.preventDefault()
    if (!forgotOtp || !forgotNewPassword) return
    setForgotError('')
    setForgotLoading(true)

    try {
      const res = await api.post('/auth/reset-password-otp/', {
        email: forgotEmail,
        otp: forgotOtp,
        new_password: forgotNewPassword
      })

      setShowForgotModal(false)
      setForgotStep(1)
      setSuccessMessage('Password reset successfully! Please sign in with your new credentials.')
      setPassword('')
    } catch (err) {
      const errData = err.response?.data
      setForgotError(errData?.otp?.[0] || errData?.new_password?.[0] || 'Could not reset password. Please check your code.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Activity className="w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Medi<span className="text-purple-600">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Clinical Portal
        </h2>
        <p className="text-sm text-slate-600">Access your role-separated telehealth workspace</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-purple-900/5 rounded-3xl border border-purple-100 sm:px-10 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600" />

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={(e) => handleLogin(e)}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email)
                    setShowForgotModal(true)
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/35 disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-7 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              ⚡ 1-Click Instant Demo Portals
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLogin(null, 'patient@mediai.com', 'patient123')}
                className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl text-center text-xs font-bold text-slate-700 hover:text-purple-700 transition-all shadow-sm"
              >
                <UserCheck className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'doctor@mediai.com', 'doctor123')}
                className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl text-center text-xs font-bold text-slate-700 hover:text-purple-700 transition-all shadow-sm"
              >
                <Stethoscope className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                Doctor
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'admin@mediai.com', 'admin123')}
                className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl text-center text-xs font-bold text-slate-700 hover:text-purple-700 transition-all shadow-sm"
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                Admin
              </button>
            </div>
          </div>

          {/* Bottom Security Disclaimers */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              HIPAA Verified
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              256-Bit SSL/TLS
            </span>
          </div>

          <div className="mt-4 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-purple-600 hover:text-purple-800">
              Create Account
            </Link>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* UNVERIFIED EMAIL OTP MODAL */}
      {/* ========================================================================= */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-100 relative text-center">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">Email Verification Required</h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Your account requires email verification. Enter the 6-digit code sent to:
              <br /><strong className="text-slate-900">{verifyEmail}</strong>
            </p>

            {verifyDevOtp && (
              <div className="mb-4 bg-purple-50 border border-purple-200 rounded-xl p-2 text-xs text-purple-800 font-semibold flex items-center justify-between">
                <span>Demo Code: <code className="font-mono font-bold">{verifyDevOtp}</code></span>
                <button
                  type="button"
                  onClick={() => setVerifyOtp(verifyDevOtp.split(''))}
                  className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {verifyError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl font-semibold">
                {verifyError}
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="flex justify-center gap-2">
                {verifyOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`verify-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleVerifyOtpChange(idx, e.target.value)}
                    className="w-11 h-12 text-center text-xl font-bold font-mono border-2 border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={verifyLoading || verifyOtp.join('').length !== 6}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm disabled:opacity-50"
              >
                {verifyLoading ? 'Verifying...' : 'Verify & Log In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD OTP MODAL */}
      {/* ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-100 relative">
            <button
              onClick={() => {
                setShowForgotModal(false)
                setForgotStep(1)
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              {forgotStep === 1 ? 'Reset Account Password' : 'Enter Authorization Code'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              {forgotStep === 1 
                ? 'Enter your registered email address and we will dispatch a 6-digit authorization code.'
                : `Enter the 6-digit authorization code dispatched to ${forgotEmail} along with your new password.`}
            </p>

            {forgotDevOtp && forgotStep === 2 && (
              <div className="mb-4 bg-purple-50 border border-purple-200 rounded-xl p-2 text-xs text-purple-800 font-semibold flex items-center justify-between">
                <span>Demo Reset Code: <code className="font-mono font-bold">{forgotDevOtp}</code></span>
                <button
                  type="button"
                  onClick={() => setForgotOtp(forgotDevOtp)}
                  className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {forgotError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl font-semibold">
                {forgotError}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending Authorization Code...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-center font-mono font-bold text-lg tracking-widest focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm disabled:opacity-50"
                >
                  {forgotLoading ? 'Updating Password...' : 'Update Password & Sign In'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
