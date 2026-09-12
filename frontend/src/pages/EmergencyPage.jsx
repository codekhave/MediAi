import React, { useState } from 'react'
import api from '../services/api'
import { 
  ShieldAlert, CheckCircle2, PhoneCall, MapPin, 
  Loader2, ArrowRight, ShieldCheck, Lock, Stethoscope, AlertCircle 
} from 'lucide-react'

export default function EmergencyPage() {
  const [emergencyType, setEmergencyType] = useState('cardiac')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [emergencyResult, setEmergencyResult] = useState(null)
  const [error, setError] = useState('')

  const handleTriggerEmergency = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/emergency/', {
        emergency_type: emergencyType,
        location_address: address || 'Current User Coordinates',
        notes: notes
      })
      setEmergencyResult(res.data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError('Failed to trigger emergency dispatch. Please call emergency services directly if urgent.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-purple-50/20 py-12 px-4 sm:px-6 lg:px-8 text-slate-900 flex flex-col justify-center">
      
      {/* Brand & Header Section */}
      <div className="max-w-2xl mx-auto text-center space-y-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/25 flex items-center justify-center mx-auto transition-transform hover:scale-105">
          <ShieldAlert className="w-6 h-6" />
        </div>
        
        <div className="inline-flex items-center gap-1.5 bg-rose-100/80 text-rose-700 text-xs font-bold px-3.5 py-1 rounded-full border border-rose-200/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>24/7 Rapid Emergency Dispatch Triage</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Emergency Duty Doctor Dispatch
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Submit an urgent medical crisis alert to be routed immediately to an available duty physician.
        </p>
      </div>

      {/* Floating Boxed Card Container */}
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-rose-900/5 rounded-3xl border border-rose-100 relative overflow-hidden">
          
          {/* Top Accent Glow Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-purple-600" />

          {/* Immediate 911 Call Banner */}
          <div className="mb-6 bg-rose-50/80 border border-rose-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-rose-950">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Life-Threatening Emergency?</span> Call national emergency response immediately.
              </div>
            </div>
            <a 
              href="tel:911" 
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shrink-0 transition-colors"
            >
              Call 911
            </a>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {!emergencyResult ? (
            <form onSubmit={handleTriggerEmergency} className="space-y-5">
              {/* Emergency Crisis Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Emergency Crisis Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'cardiac', title: 'Chest Pain / Cardiac Alert', desc: 'Pressure, arrhythmia, radiating pain' },
                    { id: 'breathing', title: 'Respiratory Distress', desc: 'Severe shortness of breath, asthma attack' },
                    { id: 'trauma', title: 'Severe Trauma / Bleeding', desc: 'Acute injury, fracture, profuse bleeding' },
                    { id: 'general', title: 'General Urgent Crisis', desc: 'Sudden collapse, high fever, anaphylaxis' }
                  ].map((t) => {
                    const isSelected = emergencyType === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setEmergencyType(t.id)}
                        className={`p-3.5 rounded-2xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-rose-50/90 border-rose-600 text-rose-950 shadow-sm ring-1 ring-rose-600/20' 
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-white'
                        }`}
                      >
                        <div className="font-bold">{t.title}</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">{t.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Current Location Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Location or Landmark
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street address, building, or hospital room..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Urgent Symptom Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Presentation & Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe patient responsiveness, vital indicators, known allergies, or timing..."
                  className="w-full p-3.5 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* Submit Dispatch Alert */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Transmitting Priority Dispatch Alert...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5" />
                    <span>DISPATCH EMERGENCY ALERT NOW</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Emergency Dispatch Confirmed</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your crisis alert has been routed to the priority duty physician queue.
                </p>
              </div>
              
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">Dispatch Status:</span>
                  <span className="font-bold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {emergencyResult.status || 'Dispatched'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">Assigned Duty Specialist:</span>
                  <span className="font-bold text-purple-700">Dr. {emergencyResult.assigned_doctor_name || 'Emergency On-Call'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold text-slate-500">Dispatch Target:</span>
                  <span className="text-slate-800 font-medium">{emergencyResult.location_address}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                The assigned duty physician has received your clinical alert with high priority and will initiate triage contact shortly.
              </p>

              <button
                type="button"
                onClick={() => { setEmergencyResult(null); setAddress(''); setNotes(''); }}
                className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Return to Emergency Dispatch
              </button>
            </div>
          )}

          {/* Trust Badges Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Lock className="w-4 h-4 text-purple-500" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Stethoscope className="w-4 h-4 text-indigo-500" />
              <span>On-Call Licensed Doctors</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
