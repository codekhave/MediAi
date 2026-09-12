import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { 
  Activity, Stethoscope, Calendar, MessageSquare, 
  FileText, ShieldAlert, LogOut, User, Bell, LayoutDashboard, CheckCircle2, Sparkles
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-purple-800 text-white flex items-center justify-center shadow-md shadow-purple-200 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Medi<span className="text-purple-600">AI</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full ml-2">
              Telehealth
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {user && user.role === 'patient' && (
            <>
              <Link to="/ai-assessment" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/ai-assessment') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <Activity className="w-4 h-4 text-purple-600" />
                AI Symptom Check
              </Link>
              <Link to="/community" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/community') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <Sparkles className="w-4 h-4 text-purple-600" />
                Health Community
              </Link>
              <Link to="/doctors" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/doctors') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <Stethoscope className="w-4 h-4 text-purple-600" />
                Find Doctors
              </Link>
              <Link to="/appointments" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/appointments') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <Calendar className="w-4 h-4 text-purple-600" />
                Appointments
              </Link>
              <Link to="/chat" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/chat') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <MessageSquare className="w-4 h-4 text-purple-600" />
                Messages
              </Link>
            </>
          )}

          {user && user.role === 'doctor' && (
            <>
              <Link to="/doctor-dashboard" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/doctor-dashboard') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <LayoutDashboard className="w-4 h-4 text-purple-600" />
                Dashboard
              </Link>
              <Link to="/community" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/community') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <Sparkles className="w-4 h-4 text-purple-600" />
                Health Community
              </Link>
              <Link to="/appointments" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/appointments') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <Calendar className="w-4 h-4 text-purple-600" />
                Consultations
              </Link>
              <Link to="/chat" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/chat') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <MessageSquare className="w-4 h-4 text-purple-600" />
                Patient Messages
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/admin-dashboard') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <LayoutDashboard className="w-4 h-4 text-purple-600" />
                Admin Overview
              </Link>
              <Link to="/community" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/community') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <Sparkles className="w-4 h-4 text-purple-600" />
                Community Feed
              </Link>
              <Link to="/doctors" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/doctors') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Doctor Verification
              </Link>
            </>
          )}

          {!user && (
            <>
              <Link to="/doctors" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/doctors') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <Stethoscope className="w-4 h-4 text-purple-600" />
                Find Doctors
              </Link>
              <Link to="/community" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/community') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}>
                <Sparkles className="w-4 h-4 text-purple-600" />
                Health Community
              </Link>
            </>
          )}
        </nav>

        {/* User Right Action Panel */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'patient' && (
                <Link to="/emergency" className="hidden sm:flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Emergency Help
                </Link>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
                  {user.first_name ? user.first_name[0] : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                    <span>{user.first_name} {user.last_name}</span>
                    {user.is_email_verified && (
                      <span title="Verified Clinical Account" className="inline-flex items-center text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-purple-600 font-semibold capitalize flex items-center gap-1">
                    <span>{user.role}</span>
                    {user.is_email_verified && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold border border-emerald-200">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleLogout} 
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm shadow-purple-200 transition-all hover:shadow-purple-300">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
