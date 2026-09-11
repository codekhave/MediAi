import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import api from '../services/api'
import { 
  Calendar, Clock, Video, FileText, CheckCircle2, 
  CreditCard, XCircle, AlertCircle, Plus, X 
} from 'lucide-react'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeNoteModal, setActiveNoteModal] = useState(null) // appointment obj
  const [noteForm, setNoteForm] = useState({
    diagnosis: '',
    subjective: '',
    objective: '',
    assessment_plan: '',
    prescription: '',
  })
  const [submittingNote, setSubmittingNote] = useState(false)

  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/appointments/')
      setAppointments(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (appointmentId) => {
    try {
      await api.post(`/appointments/${appointmentId}/pay/`)
      fetchAppointments()
    } catch (err) {
      alert('Payment processing error.')
    }
  }

  const handleDoctorConfirm = async (appointmentId) => {
    try {
      await api.patch(`/appointments/${appointmentId}/`, { status: 'confirmed' })
      fetchAppointments()
    } catch (err) {
      alert('Failed to confirm appointment.')
    }
  }

  const handleSaveNotes = async (e) => {
    e.preventDefault()
    setSubmittingNote(true)
    try {
      await api.post(`/appointments/${activeNoteModal.id}/notes/`, noteForm)
      setActiveNoteModal(null)
      fetchAppointments()
    } catch (err) {
      alert('Failed to save consultation notes.')
    } finally {
      setSubmittingNote(false)
    }
  }

  const getStatusBadge = (st) => {
    if (st === 'confirmed') return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Confirmed</span>
    if (st === 'completed') return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Completed</span>
    if (st === 'cancelled') return <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>
    return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending Approval</span>
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Consultation Appointments</h1>
            <p className="text-sm text-slate-600">Manage your scheduled telehealth video calls and clinical notes.</p>
          </div>
          {user?.role === 'patient' && (
            <button
              onClick={() => navigate('/doctors')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Book New Appointment
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Calendar className="w-12 h-12 text-purple-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Consultations Found</h3>
            <p className="text-xs text-slate-500">You do not have any active or past appointments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(app.status)}
                    <span className="text-xs font-mono text-slate-400">ID: #{app.id.slice(0, 8)}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {user?.role === 'patient' ? `Dr. ${app.doctor_name}` : `Patient: ${app.patient_name}`}
                  </h3>
                  <p className="text-xs text-purple-700 font-semibold">{app.doctor_specialization || 'Tele-consultation'}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      {app.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-purple-600" />
                      {app.start_time} - {app.end_time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                    <span className="font-bold text-slate-700">Reason:</span> {app.reason}
                  </p>
                </div>

                {/* Actions Panel */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
                  
                  {/* Payment Button for Patient */}
                  {user?.role === 'patient' && app.payment && app.payment.status === 'pending' && (
                    <button
                      onClick={() => handlePay(app.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Fee (${app.payment.amount})
                    </button>
                  )}

                  {/* Doctor Confirm Button */}
                  {user?.role === 'doctor' && app.status === 'pending' && (
                    <button
                      onClick={() => handleDoctorConfirm(app.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      Confirm Appointment
                    </button>
                  )}

                  {/* Video Call Launch Button */}
                  {(app.status === 'confirmed' || app.status === 'completed') && (
                    <button
                      onClick={() => navigate(`/room/${app.id}`)}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-200 flex items-center gap-1.5"
                    >
                      <Video className="w-4 h-4" />
                      Launch Video Consultation
                    </button>
                  )}

                  {/* Doctor Consultation Notes Trigger */}
                  {user?.role === 'doctor' && (
                    <button
                      onClick={() => {
                        setActiveNoteModal(app)
                        setNoteForm({
                          diagnosis: app.consultation_note?.diagnosis || '',
                          subjective: app.consultation_note?.subjective || '',
                          objective: app.consultation_note?.objective || '',
                          assessment_plan: app.consultation_note?.assessment_plan || '',
                          prescription: app.consultation_note?.prescription || '',
                        })
                      }}
                      className="px-3.5 py-2 border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      {app.consultation_note ? 'Edit Notes' : 'Write SOAP Notes'}
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Doctor SOAP Notes Modal */}
        {activeNoteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setActiveNoteModal(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-extrabold text-slate-900">Clinical Consultation Notes (SOAP)</h3>

              <form onSubmit={handleSaveNotes} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Primary Diagnosis</label>
                  <input
                    type="text"
                    required
                    value={noteForm.diagnosis}
                    onChange={(e) => setNoteForm({ ...noteForm, diagnosis: e.target.value })}
                    placeholder="e.g. Acute Upper Respiratory Infection"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Subjective (Symptoms Reported)</label>
                  <textarea
                    rows={2}
                    value={noteForm.subjective}
                    onChange={(e) => setNoteForm({ ...noteForm, subjective: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Objective (Observations & Vitals)</label>
                  <textarea
                    rows={2}
                    value={noteForm.objective}
                    onChange={(e) => setNoteForm({ ...noteForm, objective: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Prescription Details</label>
                  <textarea
                    rows={2}
                    value={noteForm.prescription}
                    onChange={(e) => setNoteForm({ ...noteForm, prescription: e.target.value })}
                    placeholder="Drug dosage and administration directions..."
                    className="w-full p-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveNoteModal(null)}
                    className="px-4 py-2 border rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNote}
                    className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl"
                  >
                    Save & Share Notes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
