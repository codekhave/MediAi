import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Activity, Stethoscope, Video, ShieldCheck, 
  ArrowRight, Sparkles, CheckCircle2, Clock, FileCheck, ShieldAlert 
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.2),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-200 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>AI-Assisted Telehealth & Smart Symptom Triage</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Smarter Healthcare.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-indigo-200">
                Instant Video Care.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-purple-100/90 max-w-2xl font-normal leading-relaxed">
              Describe your symptoms to our generative AI assessment tool, receive instant severity guidance, and connect directly with verified medical specialists through time-restricted video consultations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link 
                to="/ai-assessment" 
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-purple-900 font-bold rounded-xl shadow-lg shadow-purple-950/40 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-base"
              >
                <Activity className="w-5 h-5 text-purple-700" />
                Start AI Symptom Assessment
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                to="/doctors" 
                className="w-full sm:w-auto px-6 py-3.5 bg-purple-700/50 hover:bg-purple-700/80 text-white font-semibold rounded-xl border border-purple-400/30 transition-all flex items-center justify-center gap-2 text-base backdrop-blur-md"
              >
                <Stethoscope className="w-5 h-5" />
                Find Verified Doctor
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-6 text-xs text-purple-200/80 border-t border-purple-700/50">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-300" />
                <span>JWT Authenticated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-300" />
                <span>Encrypted HD Video</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-300" />
                <span>24/7 Duty Triage</span>
              </div>
            </div>
          </div>

          {/* Right Floating Card Illustration */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl shadow-purple-950/60 text-slate-900 space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">MediAI Triage Assistant</div>
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Active Symptom Check
                      </div>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Green / Mild
                  </span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "Based on reported symptoms (Fever, Mild Headache), formal consultation with a General Practitioner is recommended."
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Suggested Doctor: Dr. Sarah Jenkins</span>
                  <span className="text-purple-600 font-bold">$75.00</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Jitsi Encrypted Room</div>
                    <div className="text-[10px] text-purple-200">Signed Time-restricted Room</div>
                  </div>
                </div>
                <span className="bg-white text-purple-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  Join Room
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-purple-600 uppercase">Core Telehealth Modules</h2>
          <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Everything You Need for Seamless Remote Care
          </p>
          <p className="text-slate-600 text-base">
            MediAI unifies disconnected healthcare steps into one cohesive, role-separated platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all hover:border-purple-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Symptom Triage</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Answer interactive follow-up questions to receive a color-coded severity grading (Green, Yellow, Red) withRxNorm normalized drug lookup and clinical disclaimer.
            </p>
            <Link to="/ai-assessment" className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
              Try Assessment <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all hover:border-purple-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Doctor Directory</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Browse administrator-verified medical practitioners filtered by specialization, consultation fee, rating, and availability schedule.
            </p>
            <Link to="/doctors" className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
              Browse Doctors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all hover:border-purple-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Jitsi Video Consultations</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Join secure, time-windowed video consultation rooms generated automatically for confirmed appointment slots with integrated SOAP consultation notes.
            </p>
            <Link to="/appointments" className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
              View Appointments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-rose-900 text-white py-12 px-4 sm:px-6 lg:px-8 mb-16 mx-4 sm:mx-8 rounded-3xl shadow-xl max-w-7xl lg:mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-rose-800 text-rose-200 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              24/7 Emergency Dispatch
            </div>
            <h3 className="text-2xl font-bold">In Urgent Need of Medical Assistance?</h3>
            <p className="text-rose-100 text-sm max-w-xl">
              Our automated emergency dispatch system routes urgent requests directly to available duty doctors on standby.
            </p>
          </div>
          <Link 
            to="/emergency" 
            className="px-6 py-3 bg-white text-rose-900 font-bold rounded-xl shadow-lg hover:bg-rose-50 transition-all text-sm shrink-0"
          >
            Trigger Emergency Alert
          </Link>
        </div>
      </section>

    </div>
  )
}
