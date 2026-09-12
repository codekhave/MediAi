import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import api from '../services/api'
import { 
  Activity, Mail, Lock, User, Phone, Stethoscope, ArrowRight, 
  ShieldCheck, CheckCircle2, Clock, RotateCcw, Eye, EyeOff, 
  AlertCircle, Sparkles, Building2, KeyRound, ChevronRight
} from 'lucide-react'

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1 = Form, 2 = OTP Verification
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'patient',
    phone_number: '',
    licence_number: '',
    specialization_id: '',
  })
  const [specializations, setSpecializations] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(600) // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpSuccess, setOtpSuccess] = useState(false)

  const otpInputsRef = useRef([])
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  // Load available medical specializations for doctor registration
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const res = await api.get('/auth/specializations/')
        setSpecializations(res.data)
      } catch (err) {
        console.error('Could not load specializations:', err)
      }
    }
    loadSpecs()
  }, [])

  // 10-minute expiry countdown timer
  useEffect(() => {
    let timer
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [step, countdown])

  // Resend cooldown timer
  useEffect(() => {
    let cdTimer
    if (resendCooldown > 0) {
      cdTimer = setInterval(() => setResendCooldown(prev => prev - 1), 1000)
    }
    return () => clearInterval(cdTimer)
  }, [resendCooldown])

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remainder = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`
  }

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' }
    let score = 0
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' }
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' }
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' }
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Step 1: Submit Registration -> Send OTP
  const handleSubmitRegistration = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      role: formData.role,
      phone_number: formData.phone_number ? formData.phone_number.trim() : '',
    }

    if (formData.role === 'doctor') {
      if (formData.licence_number && formData.licence_number.trim()) {
        payload.licence_number = formData.licence_number.trim()
      }
      if (formData.specialization_id && formData.specialization_id.trim()) {
        payload.specialization_id = formData.specialization_id.trim()
      }
    }

    try {
      await api.post('/auth/register/', payload)
      setStep(2)
      setCountdown(600)
      setResendCooldown(60)
    } catch (err) {
      const errData = err.response?.data
      let message = 'Registration failed. Please review your details.'
      if (typeof errData === 'object') {
        const firstKey = Object.keys(errData)[0]
        if (firstKey) {
          const val = errData[firstKey]
          message = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : JSON.stringify(val))
        }
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Segmented OTP Input Handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Take last typed character
    setOtp(newOtp)

    // Auto-focus next input box if a digit was entered
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('')
      setOtp(digits)
      otpInputsRef.current[5]?.focus()
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.')
      return
    }

    setError('')
    setOtpLoading(true)

    try {
      const res = await api.post('/auth/verify-otp/', {
        email: formData.email,
        otp: otpCode,
        purpose: 'registration'
      })

      setOtpSuccess(true)
      const { user, token, refresh_token } = res.data
      setAuth(user, token, refresh_token)

      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin-dashboard')
        else if (user.role === 'doctor') navigate('/doctor-dashboard')
        else navigate('/patient-dashboard')
      }, 1200)
    } catch (err) {
      const errData = err.response?.data
      let message = 'Invalid or expired verification code.'
      if (errData?.otp) {
        message = Array.isArray(errData.otp) ? errData.otp[0] : errData.otp
      }
      setError(message)
    } finally {
      setOtpLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setError('')
    setOtpLoading(true)

    try {
      await api.post('/auth/resend-otp/', {
        email: formData.email,
        purpose: 'registration'
      })
      setResendCooldown(60)
      setCountdown(600)
      setOtp(['', '', '', '', '', ''])
      otpInputsRef.current[0]?.focus()
    } catch (err) {
      const errData = err.response?.data
      setError(errData?.cooldown?.[0] || 'Could not resend code. Please wait a moment.')
    } finally {
      setOtpLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
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
          {step === 1 ? 'Create Clinical Account' : 'Verify Your Email Address'}
        </h2>
        <p className="text-sm text-slate-600">
          {step === 1 
            ? 'Join the role-separated telemedicine & AI diagnostic platform' 
            : `Enter the 6-digit clinical code sent to ${formData.email}`}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-purple-900/5 rounded-3xl border border-purple-100 sm:px-10 relative overflow-hidden">
          
          {/* Subtle Top Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500" />

          {/* Error Banner */}
          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: REGISTRATION FORM */}
          {/* ========================================================================= */}
          {step === 1 && (
            <form className="space-y-4" onSubmit={handleSubmitRegistration}>
              
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'patient' })}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      formData.role === 'patient' 
                        ? 'bg-white text-purple-700 shadow-sm shadow-purple-900/10' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Patient Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'doctor' })}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      formData.role === 'doctor' 
                        ? 'bg-white text-purple-700 shadow-sm shadow-purple-900/10' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    Medical Specialist
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    placeholder="e.g. Olivia"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    placeholder="e.g. Taylor"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Doctor-specific fields */}
              {formData.role === 'doctor' && (
                <div className="space-y-3 p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <div>
                    <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      Primary Clinical Specialty
                    </label>
                    <select
                      name="specialization_id"
                      value={formData.specialization_id}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-purple-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                    >
                      <option value="">Select Specialty</option>
                      {specializations.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                      Medical Licence Number
                    </label>
                    <input
                      type="text"
                      name="licence_number"
                      placeholder="e.g. MD-CARDIO-99214"
                      value={formData.licence_number}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-purple-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Password & Live Strength Meter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-500">Security Strength:</span>
                      <span className={`${passwordStrength.score >= 75 ? 'text-emerald-600' : passwordStrength.score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Clinical Disclaimers */}
              <div className="text-[11px] text-slate-500 leading-relaxed pt-1">
                By registering, you agree to MediAI's{' '}
                <span className="text-purple-700 font-semibold cursor-pointer hover:underline">Terms of Clinical Telehealth</span> and{' '}
                <span className="text-purple-700 font-semibold cursor-pointer hover:underline">HIPAA Data Protection Policy</span>.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/35 disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Clinical Account...</span>
                  </div>
                ) : (
                  <>
                    <span>Proceed to Email Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Clinical Trust Badges */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  HIPAA Compliant
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  256-Bit SSL/TLS
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  Verified Specialists
                </span>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6 text-center">
              
              {/* Icon & Status */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner relative mb-3">
                  <Mail className="w-8 h-8" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                    ✓
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Verify Your Clinical Email
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  We've dispatched a 6-digit clinical security code to:
                  <br />
                  <strong className="text-slate-900 text-sm font-bold">{formData.email}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold underline mt-1"
                >
                  Edit email address
                </button>
              </div>

              {/* 6-Digit Segmented Pin Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono text-purple-900 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 focus:outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Countdown & Resend Option */}
              <div className="flex items-center justify-between text-xs font-semibold px-2">
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Expires in: <strong className="text-purple-700 font-mono">{formatTime(countdown)}</strong></span>
                </div>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || otpLoading}
                  onClick={handleResendOtp}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:text-slate-400 disabled:cursor-not-allowed font-bold"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform'}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              {/* Confirm / Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpSuccess || otp.join('').length !== 6}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:shadow-emerald-600/35 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {otpSuccess ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                    <span>Verified! Entering Medical Portal...</span>
                  </div>
                ) : otpLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Confirm & Activate Clinical Account</span>
                  </>
                )}
              </button>

              {/* Security Footnote */}
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by MediAI End-to-End Cryptographic Security</span>
              </div>

            </div>
          )}

          {/* Footer Link */}
          <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
            Already have an active account?{' '}
            <Link to="/login" className="font-bold text-purple-600 hover:text-purple-800">
              Sign In to Portal
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
