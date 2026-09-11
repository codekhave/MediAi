import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import api from '../services/api'
import { 
  Activity, Stethoscope, Calendar, MessageSquare, 
  FileText, ShieldAlert, Plus, Upload, CheckCircle2, Clock, Sparkles, BookOpen, ArrowRight,
  Download, Trash2, X, AlertCircle, FileCheck
} from 'lucide-react'

export default function PatientDashboard() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [assessments, setAssessments] = useState([])
  const [documents, setDocuments] = useState([])
  const [recentArticles, setRecentArticles] = useState([])

  // Document Upload State
  const [uploadTitle, setUploadTitle] = useState('')
  const [docType, setDocType] = useState('lab_report')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [appRes, aiRes, docRes, artRes] = await Promise.all([
        api.get('/appointments/'),
        api.get('/ai/history/'),
        api.get('/documents/'),
        api.get('/community/articles/')
      ])
      setAppointments(appRes.data)
      setAssessments(aiRes.data)
      setDocuments(docRes.data)
      setRecentArticles(artRes.data.slice(0, 3))
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setUploadError('')
    setUploadSuccess('')

    // Auto-fill title if empty
    if (!uploadTitle.trim()) {
      const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
      setUploadTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1))
    }
  }

  const clearSelectedFile = () => {
    setFile(null)
    setUploadTitle('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUploadDoc = async (e) => {
    e.preventDefault()
    if (!file) {
      setUploadError('Please select a file to upload.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadSuccess('')

    const titleToUse = uploadTitle.trim() || file.name.replace(/\.[^/.]+$/, '')

    const formData = new FormData()
    formData.append('title', titleToUse)
    formData.append('file', file)
    formData.append('document_type', docType)

    try {
      const res = await api.post('/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadSuccess('Document successfully encrypted and stored!')
      clearSelectedFile()
      // Prepend to documents list
      setDocuments(prev => [res.data, ...prev])
      setTimeout(() => setUploadSuccess(''), 4000)
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload document. Please check file format.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this encrypted medical record?')) return
    try {
      await api.delete(`/documents/${id}/`)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      alert('Could not delete document.')
    }
  }

  const getDocUrl = (d) => {
    let url = d.document_url || d.file
    if (!url) return '#'
    if (typeof url === 'string') {
      url = url.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8000/, '')
      if (!url.startsWith('http') && !url.startsWith('/')) {
        url = '/' + url
      }
      return url
    }
    return '#'
  }

  const formatFileSize = (d) => {
    if (d.file_size) return d.file_size
    return 'Encrypted file'
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Patient Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-purple-700/60 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30">
              Patient Portal
            </span>
            <h1 className="text-3xl font-extrabold">Welcome back, {user?.first_name}!</h1>
            <p className="text-sm text-purple-200/90 max-w-xl">
              Track your AI triage history, upcoming specialist appointments, and encrypted medical records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/ai-assessment"
              className="px-5 py-3 bg-white text-purple-900 font-bold text-xs rounded-xl shadow-lg hover:bg-purple-50 transition-all flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4 text-purple-700" />
              New AI Triage
            </Link>
            <Link
              to="/chat"
              className="px-4 py-3 bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-lg border border-purple-400/40 transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-purple-200" />
              Doctor Chat
            </Link>
            <Link
              to="/community"
              className="px-4 py-3 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg border border-indigo-400/40 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              Wellness Feed
            </Link>
          </div>
        </div>

        {/* 3 Grid Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Upcoming Consultations
              </h2>
              <Link to="/appointments" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View All</Link>
            </div>

            {appointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No consultations scheduled.</div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 3).map((app) => (
                  <div key={app.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Dr. {app.doctor_name}</span>
                      <span className="text-indigo-600 capitalize">{app.status}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2">
                      <span>{app.date}</span>
                      <span>•</span>
                      <span>{app.start_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Assessment History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Recent AI Triage
              </h2>
              <Link to="/ai-assessment" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">New Check</Link>
            </div>

            {assessments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No symptom checks taken yet.</div>
            ) : (
              <div className="space-y-3">
                {assessments.slice(0, 3).map((ass) => (
                  <div key={ass.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900">Severity Triage</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        (ass.severity || '').toUpperCase() === 'EMERGENCY' || ass.severity === 'red'
                          ? 'text-rose-700 bg-rose-50 border-rose-200'
                          : (ass.severity || '').toUpperCase() === 'URGENT' || ass.severity === 'yellow'
                          ? 'text-amber-800 bg-amber-50 border-amber-200'
                          : (ass.severity || '').toUpperCase() === 'ROUTINE'
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}>
                        {ass.severity_tier || (ass.severity || '').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{ass.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medical Documents Storage (Encrypted Records) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Encrypted Records
              </h2>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                256-Bit Encrypted
              </span>
            </div>

            {/* Success & Error alerts */}
            {uploadSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Modern Robust Upload Form */}
            <form onSubmit={handleUploadDoc} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blood Test Report, MRI Scan..."
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Record Category
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="lab_report">Lab Test Report (Blood, Urine, Biopsy)</option>
                  <option value="prescription">Doctor Prescription</option>
                  <option value="scan">Medical Imaging / Scan (X-Ray, MRI, CT)</option>
                  <option value="other">General Health Document</option>
                </select>
              </div>

              {/* File Drop / Select Area */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                  className="hidden"
                  id="patient-doc-input"
                />

                {!file ? (
                  <label
                    htmlFor="patient-doc-input"
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-xl cursor-pointer transition-colors space-y-1"
                  >
                    <Upload className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-700">Choose Medical File</span>
                    <span className="text-[10px] text-slate-400">PDF, PNG, JPG, DOC (Up to 25MB)</span>
                  </label>
                ) : (
                  <div className="p-3 bg-white border border-indigo-200 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedFile}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Encrypting & Uploading...' : 'Upload Medical File'}
              </button>
            </form>

            {/* Document List */}
            <div className="space-y-2 max-h-52 overflow-y-auto pt-1">
              {documents.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No medical documents stored yet.
                </div>
              ) : (
                documents.map((d) => (
                  <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">{d.title}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {d.document_type?.replace('_', ' ').toUpperCase()} • {formatFileSize(d)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a 
                        href={getDocUrl(d)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Download / View Record"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">View</span>
                      </a>
                      <button
                        onClick={() => handleDeleteDoc(d.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Featured Doctor Health Reads (Flo-Inspired) */}
        {recentArticles.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Daily Health & Wellness Reads
                </h2>
                <p className="text-xs text-slate-500">Curated clinical insights and lifestyle protocols from verified physicians</p>
              </div>
              <Link to="/community" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Explore All Stories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {recentArticles.map((art) => (
                <Link 
                  key={art.id}
                  to="/community"
                  className="p-4 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-all hover:shadow-md flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {art.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {art.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-700">Dr. {art.author_name}</span>
                    <span>{art.read_time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
