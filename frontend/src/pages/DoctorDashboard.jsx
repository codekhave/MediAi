import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import api from '../services/api'
import { 
  Stethoscope, Calendar, Video, Clock, 
  CheckCircle2, AlertTriangle, ShieldAlert, FileText, Sparkles,
  Upload, ShieldCheck, FileCheck, Eye, ExternalLink, Loader2, MessageSquare
} from 'lucide-react'

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [emergencies, setEmergencies] = useState([])
  const [documents, setDocuments] = useState([])
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Document Upload State
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [docFile, setDocFile] = useState(null)
  const [docForm, setDocForm] = useState({
    document_type: 'licence',
    title: '',
    file_url: ''
  })

  useEffect(() => {
    fetchDoctorData()
  }, [])

  const fetchDoctorData = async () => {
    setLoading(true)
    try {
      const [appRes, emRes, docsRes, meRes] = await Promise.all([
        api.get('/appointments/').catch(() => ({ data: [] })),
        api.get('/emergency/').catch(() => ({ data: [] })),
        api.get('/auth/doctor/documents/').catch(() => ({ data: [] })),
        api.get('/auth/me/').catch(() => ({ data: {} }))
      ])
      setAppointments(appRes.data || [])
      setEmergencies(emRes.data || [])
      setDocuments(docsRes.data || [])
      setDoctorProfile(meRes.data?.doctor_profile || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = async (e) => {
    e.preventDefault()
    if (!docFile && !docForm.file_url) {
      setUploadError('Please select a credential document file or enter a document URL.')
      return
    }
    setUploading(true)
    setUploadError('')
    setUploadSuccess('')

    try {
      const formData = new FormData()
      formData.append('document_type', docForm.document_type)
      formData.append('title', docForm.title || `${docForm.document_type.toUpperCase()} Certificate`)
      if (docFile) {
        formData.append('file', docFile)
      } else if (docForm.file_url) {
        formData.append('file_url', docForm.file_url)
      }

      const res = await api.post('/auth/doctor/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setDocuments(prev => [res.data, ...prev])
      setDocForm({
        document_type: 'licence',
        title: '',
        file_url: ''
      })
      setDocFile(null)
      setUploadSuccess('Document successfully uploaded for Medical Board review!')
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const isApproved = doctorProfile?.is_approved ?? false

  return (
    <div className="min-h-screen bg-[#FAFAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Doctor Header Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-purple-800/40">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-purple-800/70 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-600/30">
                Medical Practitioner Workspace
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isApproved 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isApproved ? '✓ Verified Clinician' : '⏳ Verification In Review'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, Dr. {user?.first_name} {user?.last_name}!</h1>
            <p className="text-sm text-purple-200/90 max-w-xl leading-relaxed">
              Manage patient consultation schedules, video room sessions, clinical triage review, and license credential verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/chat"
              className="px-4 py-2.5 bg-purple-800/80 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow border border-purple-600/40 flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-purple-200" />
              Patient Messenger
            </Link>

            <Link
              to="/community"
              className="px-5 py-2.5 bg-white text-purple-900 font-bold text-xs rounded-xl shadow-lg hover:bg-purple-50 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-700" />
              Publish Health Guide
            </Link>
          </div>
        </div>

        {/* Doctor Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-purple-100/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{appointments.length}</div>
              <div className="text-xs text-slate-500 font-bold">Scheduled Consultations</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-purple-100/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{emergencies.length}</div>
              <div className="text-xs text-slate-500 font-bold">Assigned Emergency Alerts</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-purple-100/80 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
              isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{isApproved ? 'Approved' : 'Pending'}</div>
              <div className="text-xs text-slate-500 font-bold">{documents.length} Verification Docs Uploaded</div>
            </div>
          </div>
        </div>

        {/* MEDICAL CREDENTIAL VERIFICATION PORTAL */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                Medical Credential & Verification Portal
              </h2>
              <p className="text-xs text-slate-500">
                Submit official credentials (Practicing Licence, Degree, ID) for administrative board verification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                isApproved 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {isApproved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Practitioner
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Under Board Review
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Upload Feedback Messages */}
          {uploadSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {uploadSuccess}
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 bg-rose-50 text-rose-800 text-xs font-bold rounded-2xl border border-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              {uploadError}
            </div>
          )}

          {/* Document Upload Form */}
          <form onSubmit={handleDocumentUpload} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-purple-600" />
              Upload New Credential Document
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Document Type</label>
                <select
                  value={docForm.document_type}
                  onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value })}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="licence">Medical Practicing Licence</option>
                  <option value="degree">MBBS / MD / Clinical Degree Certificate</option>
                  <option value="id_card">Government-Issued National ID / Passport</option>
                  <option value="other">Specialist Board Certification / Fellowship</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Document Title / Certificate Name</label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="e.g. GMC Practicing Certificate 2026"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Select File (PDF, PNG, JPG)</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setDocFile(e.target.files[0])}
                  className="w-full p-2 bg-white rounded-xl border border-slate-200 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow text-xs flex items-center gap-2 transition-all"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading Document...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Upload for Review
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Uploaded Credentials & Review Status ({documents.length})
            </h3>

            {documents.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                No documents uploaded yet. Please upload your medical practicing licence and degree certificate above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{doc.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold uppercase">
                          {doc.document_type}
                        </span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white hover:bg-purple-50 text-purple-700 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Consultations List */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Patient Consultation Requests
            </h2>
            <Link to="/appointments" className="text-xs font-bold text-purple-600 hover:text-purple-800">Manage All</Link>
          </div>

          {appointments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No active consultation requests.</div>
          ) : (
            <div className="space-y-3">
              {appointments.map((app) => (
                <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">Patient: {app.patient_name}</div>
                    <div className="text-slate-500">Date: {app.date} • Time: {app.start_time} - {app.end_time}</div>
                    <div className="text-slate-600 font-semibold bg-white p-2.5 rounded-xl border border-slate-100 max-w-md">
                      Reason: {app.reason}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/chat"
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-purple-700 border border-purple-200 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat Patient
                    </Link>
                    <Link
                      to="/appointments"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Open Consultation Room
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
