import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { 
  Shield, CheckCircle2, XCircle, Stethoscope, 
  Users, Activity, Calendar, ShieldCheck, FileCheck, Eye, X, Loader2, Award
} from 'lucide-react'

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Document Inspection Modal State
  const [selectedDocForReview, setSelectedDocForReview] = useState(null)
  const [doctorDocs, setDoctorDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [docRes, userRes] = await Promise.all([
        api.get('/auth/admin/doctors/'),
        api.get('/auth/admin/users/')
      ])
      setDoctors(docRes.data)
      setUsers(userRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleApproval = async (docId, currentApproval) => {
    try {
      await api.patch(`/auth/doctors/${docId}/verify/`, { is_approved: !currentApproval })
      fetchAdminData()
      if (selectedDocForReview?.id === docId) {
        setSelectedDocForReview(prev => prev ? { ...prev, is_approved: !currentApproval } : null)
      }
    } catch (err) {
      alert('Failed to update doctor verification status.')
    }
  }

  const handleOpenDocReview = async (doc) => {
    setSelectedDocForReview(doc)
    setLoadingDocs(true)
    setDoctorDocs([])
    try {
      const res = await api.get(`/auth/doctor/documents/?doctor_id=${doc.id}`)
      setDoctorDocs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDocs(false)
    }
  }

  const pendingDoctors = doctors.filter(d => !d.is_approved)
  const approvedDoctors = doctors.filter(d => d.is_approved)

  return (
    <div className="min-h-screen bg-[#FAFAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between border border-purple-800/40">
          <div className="space-y-2">
            <span className="bg-purple-800/80 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-600/40">
              Platform Administration & Governance
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Medical Board Audit & Admin Dashboard</h1>
            <p className="text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              Verify practitioner medical licenses, audit uploaded degrees and IDs, approve verified clinicians, and oversee platform users.
            </p>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-purple-100/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{users.length}</div>
              <div className="text-xs font-bold text-slate-500">Registered Users</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-purple-100/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{doctors.length}</div>
              <div className="text-xs font-bold text-slate-500">Clinical Specialists</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-purple-100/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{approvedDoctors.length}</div>
              <div className="text-xs font-bold text-slate-500">Verified Practitioners</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-purple-100/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{pendingDoctors.length}</div>
              <div className="text-xs font-bold text-slate-500">Pending Review</div>
            </div>
          </div>
        </div>

        {/* Doctor Verification Queue */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Doctor Credential Verification & Audit Queue ({doctors.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect medical licenses, fellowship degrees, and government IDs before approving practice permissions.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading doctor profiles...</div>
          ) : doctors.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No registered doctors found.</div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 text-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                      <span>Dr. {doc.user?.first_name} {doc.user?.last_name}</span>
                      <span className="text-xs text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-lg font-mono font-bold">
                        Licence: {doc.licence_number}
                      </span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="font-bold text-slate-700">Specialty: {doc.specialization_detail?.name || 'General Medicine'}</span>
                      <span>•</span>
                      <span>Experience: {doc.years_of_experience} yrs</span>
                      <span>•</span>
                      <span>Hospital: {doc.hospital_affiliation || 'MediAI Hospital Network'}</span>
                      <span>•</span>
                      <span>Consultation Fee: ${doc.consultation_fee}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <button
                      onClick={() => handleOpenDocReview(doc)}
                      className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-700 font-bold rounded-xl border border-purple-200 shadow-sm flex items-center gap-1.5 transition-all text-xs"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Inspect Documents
                    </button>

                    <span className={`font-bold px-3 py-1.5 rounded-xl text-[11px] ${
                      doc.is_approved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {doc.is_approved ? '✓ VERIFIED & APPROVED' : '⏳ PENDING REVIEW'}
                    </span>

                    <button
                      onClick={() => handleToggleApproval(doc.id, doc.is_approved)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm text-white transition-all ${
                        doc.is_approved ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {doc.is_approved ? 'Revoke Approval' : 'Approve Doctor'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Users Overview */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Platform Registered Users ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Email Verified</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-800">{u.first_name} {u.last_name || '—'}</td>
                    <td className="p-3 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'doctor' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.is_email_verified ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* DOCTOR DOCUMENT INSPECTION MODAL */}
      {selectedDocForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-purple-100 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Medical Board Audit
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Credentials for Dr. {selectedDocForReview.user?.first_name} {selectedDocForReview.user?.last_name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Licence: {selectedDocForReview.licence_number} • Specialty: {selectedDocForReview.specialization_detail?.name || 'General'}
                </p>
              </div>

              <button
                onClick={() => setSelectedDocForReview(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-600" />
                Submitted Verification Documents ({doctorDocs.length})
              </div>

              {loadingDocs ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  Fetching submitted credential documents...
                </div>
              ) : doctorDocs.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  Doctor has not uploaded credential files yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {doctorDocs.map((doc) => (
                    <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold rounded uppercase text-[10px]">
                            {doc.document_type}
                          </span>
                          <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-700 font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview Document
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Decision Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={() => setSelectedDocForReview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Audit
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleApproval(selectedDocForReview.id, selectedDocForReview.is_approved)}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow text-white transition-all ${
                    selectedDocForReview.is_approved ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {selectedDocForReview.is_approved ? 'Revoke Approval' : 'Approve Doctor Credentials & Grant Full Access'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
