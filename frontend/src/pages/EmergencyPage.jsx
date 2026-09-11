import React, { useState } from 'react'
import api from '../services/api'
import { ShieldAlert, CheckCircle2, PhoneCall, MapPin, Loader2, ArrowRight } from 'lucide-react'

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
    } catch (err) {
      setError('Failed to trigger emergency dispatch.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            24/7 Rapid Emergency Dispatch Triage
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Emergency Duty Doctor Dispatch</h1>
          <p className="text-sm text-slate-600">Submit an urgent medical crisis alert to be routed immediately to an available duty physician.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs font-bold p-3.5 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {!emergencyResult ? (
          <form onSubmit={handleTriggerEmergency} className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xl space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Emergency Crisis Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'cardiac', title: 'Chest Pain / Cardiac Alert' },
                  { id: 'breathing', title: 'Severe Respiratory Distress' },
                  { id: 'trauma', title: 'Severe Trauma / Bleeding' },
                  { id: 'general', title: 'General Urgent Crisis' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEmergencyType(t.id)}
                    className={`p-3.5 rounded-2xl text-left border text-xs font-bold transition-all ${
                      emergencyType === t.id ? 'bg-rose-50 border-rose-600 text-rose-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Location Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address or landmark for dispatch..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Urgent Symptom Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe current patient condition..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 text-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'DISPATCH EMERGENCY ALERT NOW'}
            </button>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-xl space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-extrabold text-slate-900">Emergency Dispatch Confirmed</h2>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{emergencyResult.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Assigned Duty Doctor:</span>
                <span className="font-bold text-purple-700">Dr. {emergencyResult.assigned_doctor_name || 'Standby Doctor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Location:</span>
                <span className="text-slate-800">{emergencyResult.location_address}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              The assigned duty doctor has been alerted and will initiate contact shortly.
            </p>

            <button
              onClick={() => setEmergencyResult(null)}
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700"
            >
              Return to Dispatch Screen
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
