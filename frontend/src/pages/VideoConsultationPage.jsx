import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Video, ShieldCheck, ArrowLeft, PhoneOff } from 'lucide-react'

export default function VideoConsultationPage() {
  const { id } = useParams()
  const [roomData, setRoomData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchRoom()
  }, [id])

  const fetchRoom = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/appointments/${id}/room/`)
      setRoomData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load video consultation room credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      
      {/* Top Bar */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/appointments')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              MediAI Encrypted Video Room
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </h1>
            {roomData && (
              <p className="text-xs text-purple-300">
                Patient: {roomData.patient_name} • Doctor: Dr. {roomData.doctor_name}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/appointments')}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-950"
        >
          <PhoneOff className="w-4 h-4" />
          Leave Call
        </button>
      </header>

      {/* Main Video Frame */}
      <main className="flex-1 relative flex items-center justify-center p-4">
        {loading ? (
          <div className="text-slate-400 text-sm">Initializing encrypted room connection...</div>
        ) : error ? (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-6 rounded-3xl max-w-md text-center space-y-3">
            <Video className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Access Denied</h3>
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
        ) : (
          <div className="w-full max-w-6xl h-[75vh] bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <iframe
              src={`${roomData.room_url}#config.prejoinPageEnabled=false`}
              allow="camera; microphone; display-capture; autoplay; clipboard-write"
              className="w-full h-full border-0"
              title="Jitsi Video Consultation"
            />
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="bg-slate-900 border-t border-slate-800 p-3 text-center text-xs text-slate-500">
        Jitsi Meet Signed Video Room • Room ID: {roomData?.room_name || 'Generating...'}
      </footer>

    </div>
  )
}
