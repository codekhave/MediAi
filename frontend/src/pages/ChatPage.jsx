import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import api from '../services/api'
import { 
  MessageSquare, Send, User, CheckCircle2, CheckCheck, 
  ShieldCheck, Video, Phone, Paperclip, Sparkles, Stethoscope, 
  Search, Plus, X, Loader2, ArrowLeft, MoreVertical, Lock,
  Image as ImageIcon, Film, FileText, Download, Play, Eye,
  AlertCircle, ChevronRight, ChevronDown, ExternalLink, Info,
  Clock, Award, Building2, Check, RefreshCw, Users
} from 'lucide-react'

// Sub-component: Image Attachment with Fullscreen Lightbox
function ChatImageAttachment({ src, alt, onPreview, isMe }) {
  const [hasError, setHasError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (hasError) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl max-w-sm text-xs border ${
        isMe ? 'bg-indigo-700/60 border-indigo-400/30 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
      }`}>
        <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
          <ImageIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{alt || 'Medical Scan / Image'}</div>
          <div className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>Medical image record</div>
        </div>
        <a 
          href={src} 
          target="_blank" 
          rel="noreferrer" 
          className={`p-2 rounded-lg transition-colors ${
            isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Open Image"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    )
  }

  return (
    <div 
      className="relative group cursor-pointer overflow-hidden rounded-xl border border-black/10 max-w-xs sm:max-w-sm bg-slate-900/5 shadow-xs transition-transform hover:scale-[1.01]"
      onClick={() => onPreview({ type: 'image', url: src, name: alt })}
    >
      {!loaded && (
        <div className="h-44 w-full bg-slate-200 animate-pulse flex items-center justify-center text-slate-400 text-xs">
          Loading scan...
        </div>
      )}
      <img 
        src={src} 
        alt={alt || 'Clinical scan'}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full max-h-64 object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0 h-0'}`}
      />
      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
        <span className="bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
          <Eye className="w-3.5 h-3.5 text-indigo-600" /> View Full Scan
        </span>
      </div>
    </div>
  )
}

// Sub-component: Video Attachment Player
function ChatVideoAttachment({ src, name }) {
  return (
    <div className="max-w-xs sm:max-w-sm rounded-xl overflow-hidden shadow-sm bg-black border border-slate-700/60">
      <video 
        src={src} 
        controls 
        playsInline
        preload="metadata"
        className="w-full max-h-56 rounded-xl bg-black"
      />
      {name && (
        <div className="px-3 py-1.5 bg-slate-900 text-[11px] text-slate-300 flex items-center gap-1.5 truncate border-t border-slate-800">
          <Film className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{name}</span>
        </div>
      )}
    </div>
  )
}

// Sub-component: Document Attachment Card
function ChatDocumentAttachment({ src, name, size, isMe }) {
  return (
    <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 max-w-xs sm:max-w-sm shadow-xs ${
      isMe 
        ? 'bg-indigo-700/60 border-indigo-400/40 text-white' 
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`p-2.5 rounded-xl shrink-0 ${
          isMe ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold truncate">{name || 'Clinical Document.pdf'}</div>
          <div className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'} flex items-center gap-1 mt-0.5`}>
            <span>{size || 'PDF Document'}</span>
            <span>•</span>
            <span className="font-medium text-emerald-500">Verified</span>
          </div>
        </div>
      </div>
      <a 
        href={src} 
        download={name || 'medical_document'} 
        target="_blank" 
        rel="noreferrer"
        className={`p-2 rounded-xl shrink-0 transition-colors ${
          isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-600 border border-slate-200/60'
        }`}
        title="Download Medical Record"
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  )
}

// Sub-component: Structured Clinical Triage Memo Card
function ChatTriageMemoCard({ content, isMe }) {
  const lines = content.split('\n')
  const urgencyLine = lines.find(l => l.includes('Urgency Level:')) || ''
  const urgency = urgencyLine.replace('• Urgency Level:', '').trim()
  const summaryLine = lines.find(l => l.includes('Summary:')) || ''
  const summary = summaryLine.replace('• Summary:', '').trim()
  const cluesLine = lines.find(l => l.includes('Differential Clues:')) || ''
  const clues = cluesLine.replace('• Differential Clues:', '').trim()
  const precautionLine = lines.find(l => l.includes('Critical Precaution:')) || ''
  const precaution = precautionLine.replace('• Critical Precaution:', '').trim()
  const safeOptionLine = lines.find(l => l.includes('Safe Supportive Bridge:')) || ''
  const safeOption = safeOptionLine.replace('• Safe Supportive Bridge:', '').trim()

  return (
    <div className="rounded-xl overflow-hidden border border-indigo-200/90 bg-white text-slate-900 shadow-sm max-w-sm sm:max-w-md">
      <div className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-indigo-200" />
          <span className="text-xs font-bold tracking-wide uppercase">AI Clinical Triage Memo</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
          urgency.includes('EMERGENCY') ? 'bg-rose-500 text-white' :
          urgency.includes('URGENT') ? 'bg-amber-400 text-amber-950 font-bold' :
          'bg-emerald-400 text-emerald-950 font-bold'
        }`}>
          {urgency || 'CLINICAL MEMO'}
        </span>
      </div>

      <div className="p-3.5 space-y-2.5 text-xs">
        {summary && (
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Patient Summary</div>
            <div className="text-slate-700 font-medium mt-0.5 leading-snug">{summary}</div>
          </div>
        )}

        {clues && (
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Differential Clues</div>
            <div className="text-indigo-600 font-medium mt-0.5">{clues}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          {precaution && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
              <div className="text-[10px] font-bold text-rose-700 uppercase">Strictly Avoid</div>
              <div className="text-[11px] text-rose-900 font-medium mt-0.5">{precaution}</div>
            </div>
          )}
          {safeOption && (
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Safe Supportive Bridge</div>
              <div className="text-[11px] text-emerald-900 font-medium mt-0.5">{safeOption}</div>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-400 italic pt-1 text-center">
          Transmitted to physician for clinical consultation review
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user, setAuth } = useAuthStore()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMsg, setInputMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'specialists' | 'patients'

  // Doctors and Patients directory
  const [allDoctors, setAllDoctors] = useState([])
  const [allPatients, setAllPatients] = useState([])

  // Side Drawer state for physician details & media gallery
  const [showDoctorDrawer, setShowDoctorDrawer] = useState(false)

  // File Attachment State
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)

  // Fullscreen Lightbox Modal
  const [lightboxMedia, setLightboxMedia] = useState(null)

  // Hidden File Input Refs
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const docInputRef = useRef(null)

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  // Patient Latest Assessment for Quick Sharing
  const [latestAssessment, setLatestAssessment] = useState(null)
  const [sharingAssessment, setSharingAssessment] = useState(false)

  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    fetchDirectory()
    if (user?.role === 'patient') {
      fetchLatestAssessment()
    }
  }, [user])

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id)
      connectWebSocket(activeConv.id)
    }
    return () => {
      if (socketRef.current) socketRef.current.close()
    }
  }, [activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await api.get('/chat/conversations/')
      setConversations(res.data)
      if (res.data.length > 0 && !activeConv) {
        setActiveConv(res.data[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDirectory = async () => {
    try {
      const docRes = await api.get('/auth/doctors/')
      setAllDoctors(docRes.data || [])
    } catch (err) {
      console.error('Failed to load doctors directory:', err)
    }

    try {
      const patRes = await api.get('/auth/patients/')
      setAllPatients(patRes.data || [])
    } catch (err) {
      // optional
    }
  }

  const fetchLatestAssessment = async () => {
    try {
      const res = await api.get('/ai/assessments/')
      if (res.data && res.data.length > 0) {
        setLatestAssessment(res.data[0])
      }
    } catch (err) {
      // Fallback
    }
  }

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages/`)
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const connectWebSocket = (convId) => {
    if (socketRef.current) socketRef.current.close()

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const wsHost = isLocal ? window.location.host : 'mediai-1-dfc2.onrender.com'
    const wsScheme = isLocal && window.location.protocol !== 'https:' ? 'ws' : 'wss'
    const wsUrl = `${wsScheme}://${wsHost}/ws/chat/${convId}/`
    
    try {
      const socket = new WebSocket(wsUrl)
      socketRef.current = socket

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data)
        setMessages((prev) => {
          if (prev.some(m => m.id === data.id)) return prev
          return [...prev, data]
        })
      }
    } catch (err) {
      console.warn('WebSocket fallback to standard API delivery')
    }
  }

  // Quick switch doctor/consultation
  const handleSelectDoctor = async (docId) => {
    setShowDoctorSwitcherDropdown(false)
    setShowNewChatModal(false)

    // Check if conversation already exists with this doctor
    const existing = conversations.find(c => c.doctor === docId || c.doctor_detail?.id === docId)
    if (existing) {
      setActiveConv(existing)
      return
    }

    // Otherwise create or get conversation
    try {
      const res = await api.post('/chat/conversations/', { doctor_id: docId })
      setConversations(prev => {
        if (prev.some(c => c.id === res.data.id)) return prev
        return [res.data, ...prev]
      })
      setActiveConv(res.data)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to switch to specialist.')
    }
  }

  // Quick switch patient (when doctor is logged in)
  const handleSelectPatient = async (patientId) => {
    setShowDoctorSwitcherDropdown(false)
    setShowNewChatModal(false)

    const existing = conversations.find(c => c.patient === patientId || c.patient_detail?.id === patientId)
    if (existing) {
      setActiveConv(existing)
      return
    }

    try {
      const res = await api.post('/chat/conversations/', { patient_id: patientId })
      setConversations(prev => {
        if (prev.some(c => c.id === res.data.id)) return prev
        return [res.data, ...prev]
      })
      setActiveConv(res.data)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to open consultation channel.')
    }
  }



  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setFileType(type)
    setShowAttachMenu(false)

    if (type === 'image' || type === 'video') {
      const previewUrl = URL.createObjectURL(file)
      setFilePreview(previewUrl)
    } else {
      setFilePreview(null)
    }
  }

  const clearSelectedFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview)
    }
    setSelectedFile(null)
    setFilePreview(null)
    setFileType(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
    if (docInputRef.current) docInputRef.current.value = ''
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if ((!inputMsg.trim() && !selectedFile) || !activeConv || uploading) return

    setUploading(true)

    try {
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('file_type', fileType || 'document')
        formData.append('file_name', selectedFile.name)
        if (inputMsg.trim()) {
          formData.append('content', inputMsg.trim())
        } else {
          formData.append(
            'content', 
            fileType === 'image' ? 'Shared an image scan' : fileType === 'video' ? 'Shared a clinical video' : `Shared document: ${selectedFile.name}`
          )
        }

        const res = await api.post(`/chat/conversations/${activeConv.id}/messages/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        setMessages((prev) => {
          if (prev.some(m => m.id === res.data.id)) return prev
          return [...prev, res.data]
        })
        setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, last_message: res.data } : c))
        setInputMsg('')
        clearSelectedFile()
      } else {
        const msgContent = inputMsg.trim()
        setInputMsg('')

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            message: msgContent,
            sender_id: user.id
          }))
        } else {
          const res = await api.post(`/chat/conversations/${activeConv.id}/messages/`, { content: msgContent })
          setMessages((prev) => {
            if (prev.some(m => m.id === res.data.id)) return prev
            return [...prev, res.data]
          })
          setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, last_message: res.data } : c))
        }
      }
    } catch (err) {
      console.error('Failed to deliver message:', err)
      alert('Could not deliver message. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleShareAssessment = async () => {
    if (!latestAssessment || !activeConv) return
    setSharingAssessment(true)
    setShowAttachMenu(false)

    const contraindication = latestAssessment.what_to_do_and_not_do?.strictly_avoid?.[0] || 'Avoid NSAID painkillers'
    const safeOption = latestAssessment.what_to_do_and_not_do?.safe_supportive_actions?.[0] || 'Paracetamol 500mg'

    const memo = `📋 CLINICAL TRIAGE MEMO (Pre-Consultation Assessment)
• Urgency Level: ${latestAssessment.severity_tier || latestAssessment.severity?.toUpperCase() || 'ROUTINE'}
• Summary: ${latestAssessment.summary || 'Patient reported spinal pain with movement limitations.'}
• Differential Clues: ${latestAssessment.possible_conditions?.join(', ') || 'Lumbar strain / Mechanical spine'}
• Critical Precaution: ${contraindication}
• Safe Supportive Bridge: ${safeOption}

Doctor, please review this triage memo for our consultation.`

    try {
      const res = await api.post(`/chat/conversations/${activeConv.id}/messages/`, { content: memo })
      setMessages(prev => {
        if (prev.some(m => m.id === res.data.id)) return prev
        return [...prev, res.data]
      })
      setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, last_message: res.data } : c))
    } catch (err) {
      console.error(err)
    } finally {
      setSharingAssessment(false)
    }
  }

  const getMediaUrl = (msg) => {
    let url = msg.file_url || msg.file
    if (!url) return null
    if (typeof url === 'string') {
      url = url.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8000/, '')
      if (!url.startsWith('http')) {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        const base = isLocal ? '' : 'https://mediai-1-dfc2.onrender.com'
        if (!url.startsWith('/')) url = '/' + url
        return base + url
      }
      return url
    }
    return null
  }

  const partnerName = activeConv ? (
    user?.role === 'patient' 
      ? `Dr. ${activeConv.doctor_detail?.user?.first_name || ''} ${activeConv.doctor_detail?.user?.last_name || ''}`
      : `${activeConv.patient_detail?.first_name || ''} ${activeConv.patient_detail?.last_name || ''}`
  ) : ''

  const partnerSpecialty = activeConv?.doctor_detail?.specialization_detail?.name || 'Senior Medical Specialist'
  const partnerHospital = activeConv?.doctor_detail?.hospital_affiliation || 'MediAI Clinical Network'

  const filteredConversations = conversations.filter(c => {
    const name = user?.role === 'patient'
      ? `Dr. ${c.doctor_detail?.user?.first_name || ''} ${c.doctor_detail?.user?.last_name || ''}`
      : `${c.patient_detail?.first_name || ''} ${c.patient_detail?.last_name || ''}`
    return name.toLowerCase().includes(searchFilter.toLowerCase())
  })

  // Filter available doctors not currently active
  const uncontactedDoctors = allDoctors.filter(d => 
    !conversations.some(c => c.doctor === d.id || c.doctor_detail?.id === d.id)
  )

  const sharedMediaMessages = messages.filter(m => getMediaUrl(m))

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-slate-100/60 p-0 sm:p-2 lg:p-3 text-slate-900">
      
      {/* Master Chat Container: Fits viewport precisely */}
      <div className="h-full w-full max-w-7xl mx-auto bg-white rounded-none sm:rounded-2xl border-0 sm:border border-slate-200/90 shadow-xl flex flex-col md:flex-row overflow-hidden relative">
        
        {/* ========================================================= */}
        {/* LEFT DIRECTORY: ALWAYS VISIBLE SIDEBAR                    */}
        {/* ========================================================= */}
        <div className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col h-full border-r border-slate-200 bg-slate-50/80 overflow-hidden ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          
          {/* User Profile Bar & Demo Switcher */}
          <div className="shrink-0 p-3 sm:p-4 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {user?.first_name?.[0] || 'U'}
                  </div>
                  <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">{user?.full_name}</div>
                  
                  {/* Clinical Portal Badge */}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 capitalize bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    {user?.role} Portal
                  </span>
                </div>
              </div>

              {/* New Consultation Button */}
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0"
                title="Start New Clinical Consultation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>
          </div>

          {/* Search Filter & Tabs */}
          <div className="shrink-0 p-2.5 bg-white border-b border-slate-200/80 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search consultations or doctors..."
                className="w-full pl-9 pr-8 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-xl text-xs border border-transparent focus:border-indigo-300 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {searchFilter && (
                <button 
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterTab === 'all' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                All Chats ({conversations.length})
              </button>
              <button
                onClick={() => setFilterTab('specialists')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterTab === 'specialists' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                All Specialists ({allDoctors.length})
              </button>
            </div>
          </div>

          {/* Scrollable Directory Area */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span>Loading consultations...</span>
              </div>
            ) : (
              <>
                {/* SECTION 1: ACTIVE CONVERSATIONS */}
                {filteredConversations.length > 0 && (
                  <div>
                    <div className="px-3.5 py-1.5 bg-slate-100/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Active Consultations</span>
                      <span>{filteredConversations.length}</span>
                    </div>

                    {filteredConversations.map((c) => {
                      const name = user?.role === 'patient' 
                        ? `Dr. ${c.doctor_detail?.user?.first_name || ''} ${c.doctor_detail?.user?.last_name || ''}`
                        : `${c.patient_detail?.first_name || ''} ${c.patient_detail?.last_name || ''}`
                      
                      const spec = c.doctor_detail?.specialization_detail?.name || 'Physician'
                      const isSelected = activeConv?.id === c.id

                      return (
                        <button
                          key={c.id}
                          onClick={() => setActiveConv(c)}
                          className={`w-full p-3 text-left flex items-start gap-3 transition-all border-b border-slate-100/80 ${
                            isSelected 
                              ? 'bg-indigo-50/90 border-l-4 border-indigo-600 text-indigo-950 font-medium' 
                              : 'hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="relative shrink-0 mt-0.5">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 text-indigo-700 flex items-center justify-center font-bold text-sm border border-slate-200/80 shadow-2xs">
                              {name.replace('Dr. ', '')[0] || 'D'}
                            </div>
                            <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                                {name}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                {c.last_message ? new Date(c.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <div className="text-[11px] text-indigo-600 font-semibold truncate flex items-center gap-1 mt-0.5">
                              <span>{spec}</span>
                              <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {c.last_message?.file_type === 'image' ? '📷 Shared photo scan' :
                               c.last_message?.file_type === 'video' ? '🎥 Shared video clip' :
                               c.last_message?.file_type === 'document' ? `📄 ${c.last_message.file_name || 'Document'}` :
                               c.last_message?.content?.includes('CLINICAL TRIAGE MEMO') ? '🩺 AI Triage Memo' :
                               (c.last_message?.content || 'Consultation channel initialized')}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* SECTION 2: AVAILABLE SPECIALISTS (INSTANT SWITCHING) */}
                {user?.role === 'patient' && uncontactedDoctors.length > 0 && (
                  <div className="pt-2">
                    <div className="px-3.5 py-1.5 bg-slate-100/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Available Specialists</span>
                      <span>{uncontactedDoctors.length} doctors</span>
                    </div>

                    {uncontactedDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectDoctor(doc.id)}
                        className="p-3 hover:bg-indigo-50/60 flex items-center justify-between gap-2.5 cursor-pointer transition-colors border-b border-slate-100/80"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {doc.user?.first_name?.[0] || 'D'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                              <span>Dr. {doc.user?.first_name} {doc.user?.last_name}</span>
                              <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
                            </div>
                            <div className="text-[11px] text-indigo-600 font-medium truncate">
                              {doc.specialization_detail?.name || 'Medical Specialist'}
                            </div>
                          </div>
                        </div>

                        <button className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-semibold text-[10px] rounded-lg transition-colors shrink-0">
                          Start Chat
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* SECTION 3: REGISTERED PATIENTS (FOR DOCTORS) */}
                {user?.role === 'doctor' && allPatients.length > 0 && (
                  <div className="pt-2">
                    <div className="px-3.5 py-1.5 bg-slate-100/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Registered Patients</span>
                      <span>{allPatients.length}</span>
                    </div>

                    {allPatients.map((pat) => (
                      <div
                        key={pat.id}
                        onClick={() => handleSelectPatient(pat.id)}
                        className="p-3 hover:bg-indigo-50/60 flex items-center justify-between gap-2.5 cursor-pointer transition-colors border-b border-slate-100/80"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {pat.first_name?.[0] || 'P'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {pat.first_name} {pat.last_name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {pat.email}
                            </div>
                          </div>
                        </div>

                        <button className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-semibold text-[10px] rounded-lg transition-colors shrink-0">
                          Consult
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Security Footer */}
          <div className="shrink-0 p-2.5 bg-white border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit HIPAA Encrypted Channel</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT CHAT PANEL: FIXED HEADER & SCROLLABLE THREAD       */}
        {/* ========================================================= */}
        <div className={`flex-1 flex flex-col h-full min-w-0 bg-slate-50/60 overflow-hidden ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* TOP HEADER: ALWAYS PINNED AND VISIBLE */}
              <div className="shrink-0 p-3 sm:p-4 bg-white border-b border-slate-200 shadow-2xs z-20 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back button */}
                  <button 
                    onClick={() => setActiveConv(null)}
                    className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 mr-1"
                    title="Back to Consultations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Partner Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs ring-2 ring-indigo-50">
                      {partnerName.replace('Dr. ', '')[0] || 'D'}
                    </div>
                    <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5 shadow-xs" />
                  </div>

                  {/* Partner Name & Specialty with Switcher Dropdown */}
                  <div className="min-w-0 relative">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {partnerName}
                      </h3>
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      
                      {/* Doctor Switcher Button */}
                      <button
                        onClick={() => setShowDoctorSwitcherDropdown(!showDoctorSwitcherDropdown)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ml-1"
                        title="Switch to another Doctor or Consultation"
                      >
                        <span>Switch</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
                      <span className="text-indigo-600 font-semibold truncate">{partnerSpecialty}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 truncate">{partnerHospital}</span>
                    </div>

                    {/* Instant Doctor Switcher Dropdown Menu */}
                    {showDoctorSwitcherDropdown && (
                      <div className="absolute top-11 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                          Select Consultation or Specialist:
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {user?.role === 'patient' ? (
                            allDoctors.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() => handleSelectDoctor(doc.id)}
                                className="w-full text-left p-2 hover:bg-indigo-50 rounded-xl flex items-center justify-between transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                                    {doc.user?.first_name?.[0] || 'D'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                      Dr. {doc.user?.first_name} {doc.user?.last_name}
                                    </div>
                                    <div className="text-[10px] text-indigo-600 truncate">
                                      {doc.specialization_detail?.name || 'Specialist'}
                                    </div>
                                  </div>
                                </div>
                                {(activeConv?.doctor === doc.id || activeConv?.doctor_detail?.id === doc.id) && (
                                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                                )}
                              </button>
                            ))
                          ) : (
                            allPatients.map((pat) => (
                              <button
                                key={pat.id}
                                onClick={() => handleSelectPatient(pat.id)}
                                className="w-full text-left p-2 hover:bg-indigo-50 rounded-xl flex items-center justify-between transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                    {pat.first_name?.[0] || 'P'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                      {pat.first_name} {pat.last_name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {pat.email}
                                    </div>
                                  </div>
                                </div>
                                {(activeConv?.patient === pat.id || activeConv?.patient_detail?.id === pat.id) && (
                                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {latestAssessment && user?.role === 'patient' && (
                    <button
                      onClick={handleShareAssessment}
                      disabled={sharingAssessment}
                      className="hidden lg:inline-flex px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200/80 items-center gap-1.5 transition-colors shadow-2xs"
                      title="Send your AI Symptom Assessment memo to doctor"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Share Triage</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/appointments')}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:shadow-indigo-200"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Video Call</span>
                  </button>

                  <button
                    onClick={() => setShowDoctorDrawer(!showDoctorDrawer)}
                    className={`p-1.5 sm:p-2 rounded-xl border transition-colors ${
                      showDoctorDrawer 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80'
                    }`}
                    title="Physician Details & Shared Media"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SECURITY PILL BANNER */}
              <div className="shrink-0 py-1.5 px-4 bg-slate-50/90 text-center border-b border-slate-100">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit HIPAA Encrypted Channel • Direct Patient-Physician Consultation</span>
                </div>
              </div>

              {/* MESSAGES FEED: SCROLLS FREELY INSIDE ITS CONTAINER */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-3">
                <div className="flex items-center justify-center my-1">
                  <span className="px-3 py-0.5 bg-slate-200/70 text-slate-600 rounded-full text-[10px] font-semibold tracking-wide uppercase shadow-2xs">
                    Today
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="max-w-sm mx-auto my-12 bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">Encrypted Consultation Initialized</div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Send symptom questions, clinical photos, lab PDF reports, or video recordings to start your specialist consultation.
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMe = m.sender === user?.id || m.sender_id === user?.id
                    const isTriage = m.content?.includes('CLINICAL TRIAGE MEMO')
                    const mediaUrl = getMediaUrl(m)

                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                        <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[78%]">
                          {/* Doctor Avatar for incoming messages */}
                          {!isMe && (
                            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mb-1 shadow-2xs">
                              {partnerName.replace('Dr. ', '')[0] || 'D'}
                            </div>
                          )}

                          {/* Message Bubble Body */}
                          <div className={`p-3.5 rounded-2xl text-xs space-y-2.5 shadow-xs ${
                            isMe 
                              ? 'bg-linear-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-xs' 
                              : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200/90'
                          }`}>
                            
                            {/* Sender Header for Incoming Doctor Messages */}
                            {!isMe && (
                              <div className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                                <span>{partnerName}</span>
                                <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                              </div>
                            )}

                            {/* RICH MEDIA ATTACHMENTS */}
                            {mediaUrl && (
                              <div className="space-y-1.5 pt-0.5">
                                {/* Image scan */}
                                {m.file_type === 'image' && (
                                  <ChatImageAttachment 
                                    src={mediaUrl} 
                                    alt={m.file_name || 'Uploaded scan'} 
                                    onPreview={setLightboxMedia}
                                    isMe={isMe}
                                  />
                                )}

                                {/* Video recording */}
                                {m.file_type === 'video' && (
                                  <ChatVideoAttachment 
                                    src={mediaUrl} 
                                    name={m.file_name || 'Video attachment'} 
                                  />
                                )}

                                {/* Document / Lab PDF */}
                                {m.file_type === 'document' && (
                                  <ChatDocumentAttachment 
                                    src={mediaUrl} 
                                    name={m.file_name || 'Diagnostic Lab Report.pdf'} 
                                    size={m.file_size} 
                                    isMe={isMe} 
                                  />
                                )}
                              </div>
                            )}

                            {/* Text Body / Triage Memo */}
                            {m.content && (
                              isTriage ? (
                                <ChatTriageMemoCard content={m.content} isMe={isMe} />
                              ) : (
                                <div className={`leading-relaxed whitespace-pre-line text-xs sm:text-sm ${
                                  isMe ? 'text-white' : 'text-slate-800 font-normal'
                                }`}>
                                  {m.content}
                                </div>
                              )
                            )}

                            {/* Footer Timestamp & Read Receipt */}
                            <div className={`text-[10px] flex items-center justify-end gap-1.5 pt-0.5 ${
                              isMe ? 'text-indigo-200' : 'text-slate-400'
                            }`}>
                              <span>
                                {(() => {
                                  if (!m.timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  const d = new Date(m.timestamp)
                                  return isNaN(d.getTime()) ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                })()}
                              </span>
                              {isMe && (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-200 inline" />
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* QUICK CLINICAL ACTIONS RIBBON */}
              <div className="shrink-0 bg-white/90 border-t border-slate-200/70 px-4 py-2 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Quick Actions:</span>
                
                {latestAssessment && user?.role === 'patient' && (
                  <button
                    onClick={handleShareAssessment}
                    disabled={sharingAssessment}
                    className="shrink-0 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg flex items-center gap-1.5 border border-indigo-200/60 transition-colors"
                  >
                    <Stethoscope className="w-3 h-3 text-indigo-600" />
                    <span>Share AI Triage</span>
                  </button>
                )}

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3 h-3 text-indigo-600" />
                  <span>Attach Scan</span>
                </button>

                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Film className="w-3 h-3 text-rose-600" />
                  <span>Video Recording</span>
                </button>

                <button
                  onClick={() => docInputRef.current?.click()}
                  className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3 h-3 text-emerald-600" />
                  <span>Lab PDF Report</span>
                </button>
              </div>

              {/* STAGED FILE PREVIEW BAR */}
              {selectedFile && (
                <div className="shrink-0 bg-indigo-50/80 p-2.5 px-4 border-t border-indigo-100 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    {filePreview && fileType === 'image' ? (
                      <img src={filePreview} alt="Preview" className="w-11 h-11 object-cover rounded-xl border border-indigo-200 shrink-0 shadow-2xs" />
                    ) : filePreview && fileType === 'video' ? (
                      <div className="w-11 h-11 bg-slate-900 text-rose-400 flex items-center justify-center rounded-xl shrink-0 shadow-2xs">
                        <Film className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl border border-emerald-200 shrink-0 shadow-2xs">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</div>
                      <div className="text-[11px] text-indigo-700 font-medium flex items-center gap-1 mt-0.5">
                        <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>Ready to transmit securely</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={clearSelectedFile}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-white/80 transition-colors"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* INPUT AREA: ALWAYS PINNED AT THE BOTTOM */}
              <div className="shrink-0 relative bg-white border-t border-slate-200 p-3 sm:p-4">
                {/* Popover Attachment Menu */}
                {showAttachMenu && (
                  <div className="absolute bottom-18 left-4 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 w-64 z-20 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">Attach Clinical Records</div>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Photos & Scans</div>
                        <div className="text-[10px] text-slate-400 font-normal">PNG, JPG, anatomical diagrams</div>
                      </div>
                    </button>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Video Recording</div>
                        <div className="text-[10px] text-slate-400 font-normal">Mobility & symptom clips</div>
                      </div>
                    </button>
                    <button
                      onClick={() => docInputRef.current?.click()}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Document / Lab PDF</div>
                        <div className="text-[10px] text-slate-400 font-normal">Blood tests, doctor notes, RX</div>
                      </div>
                    </button>

                    {latestAssessment && user?.role === 'patient' && (
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleShareAssessment}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <div>
                            <div>Share AI Triage Memo</div>
                            <div className="text-[10px] text-slate-400 font-normal">Latest AI symptom assessment</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileSelect(e, 'image')} 
                />
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  accept="video/*" 
                  className="hidden" 
                  onChange={(e) => handleFileSelect(e, 'video')} 
                />
                <input 
                  type="file" 
                  ref={docInputRef} 
                  accept=".pdf,.doc,.docx,.txt,.csv" 
                  className="hidden" 
                  onChange={(e) => handleFileSelect(e, 'document')} 
                />

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                      showAttachMenu 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                    title="Attach Photos, Videos, or Documents"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    placeholder={selectedFile ? "Add a message caption (optional)..." : "Type a clinical question or symptom update... (Press Enter to send)"}
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-100/80 focus:bg-white border border-transparent focus:border-indigo-300 rounded-xl text-xs sm:text-sm focus:outline-none transition-all placeholder:text-slate-400"
                  />

                  <button
                    type="submit"
                    disabled={(!inputMsg.trim() && !selectedFile) || uploading}
                    className="w-10 h-10 bg-linear-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all flex items-center justify-center shrink-0 hover:scale-[1.02] active:scale-95 hover:shadow-indigo-200"
                    title="Send Message"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs border border-indigo-100">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Direct Doctor-Patient Telehealth Channel</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Select an ongoing consultation thread from the directory or choose a doctor below to begin.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all hover:shadow-indigo-200"
              >
                <Plus className="w-4 h-4" />
                Select Doctor & Begin Consultation
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT SLIDE-OUT DRAWER: PHYSICIAN DETAILS & SHARED MEDIA  */}
        {/* ========================================================= */}
        {showDoctorDrawer && activeConv && (
          <div className="absolute inset-y-0 right-0 z-40 w-80 sm:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Clinical Details</span>
              </div>
              <button 
                onClick={() => setShowDoctorDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="text-center space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
                  {partnerName.replace('Dr. ', '')[0] || 'D'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center justify-center gap-1">
                    <span>{partnerName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  </h4>
                  <div className="text-xs text-indigo-600 font-semibold">{partnerSpecialty}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{partnerHospital}</div>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <span className="px-2.5 py-1 bg-white rounded-full text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-2xs">
                    MD, FACC
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 rounded-full text-[10px] font-semibold text-emerald-700 border border-emerald-200 shadow-2xs">
                    Licensed & Verified
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consultation Tools</div>
                <button
                  onClick={() => navigate('/appointments')}
                  className="w-full p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-between border border-indigo-200/60 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-600" />
                    Launch Video Consultation
                  </span>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Shared Attachments</span>
                  <span className="text-[10px] text-slate-400">{sharedMediaMessages.length} records</span>
                </div>

                {sharedMediaMessages.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                    No attachments shared yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {sharedMediaMessages.map((sm, i) => {
                      const url = getMediaUrl(sm)
                      if (sm.file_type === 'image') {
                        return (
                          <div 
                            key={i} 
                            onClick={() => setLightboxMedia({ type: 'image', url, name: sm.file_name })}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square cursor-pointer bg-slate-100 shadow-2xs"
                          >
                            <img src={url} alt={sm.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )
                      }
                      return (
                        <a 
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex flex-col justify-between aspect-square text-left transition-colors"
                        >
                          <div className="p-1.5 bg-white rounded-lg w-fit shadow-2xs">
                            {sm.file_type === 'video' ? <Film className="w-4 h-4 text-rose-600" /> : <FileText className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-semibold text-slate-800 truncate">{sm.file_name || 'Document'}</div>
                            <div className="text-[9px] text-slate-400 capitalize">{sm.file_type || 'File'}</div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* LIGHTBOX MODAL FOR IMAGES */}
      {lightboxMedia && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              title="Close Scan Preview"
            >
              <X className="w-6 h-6" />
            </button>
            {lightboxMedia.type === 'image' && (
              <img 
                src={lightboxMedia.url} 
                alt={lightboxMedia.name || 'Clinical Scan Preview'} 
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              />
            )}
            <div className="mt-3 text-xs text-white/80 font-medium flex items-center gap-2">
              <span>{lightboxMedia.name || 'Clinical Anatomical Scan'}</span>
              <a 
                href={lightboxMedia.url} 
                download={lightboxMedia.name || 'clinical_scan'} 
                target="_blank" 
                rel="noreferrer"
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* NEW CHAT / SELECT SPECIALIST MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-indigo-600" />
                  Connect with a Medical Doctor
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Select an approved physician for direct secure messaging.</p>
              </div>

              <button
                onClick={() => setShowNewChatModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {allDoctors.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No doctors currently listed.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {allDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoctor(doc.id)}
                    className="p-3.5 bg-slate-50 hover:bg-indigo-50/70 rounded-2xl border border-slate-200/80 hover:border-indigo-300 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shadow-2xs">
                        {doc.user?.first_name?.[0] || 'D'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <span>Dr. {doc.user?.first_name} {doc.user?.last_name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <div className="text-[11px] text-indigo-600 font-semibold">
                          {doc.specialization_detail?.name || 'General Practitioner'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {doc.hospital_affiliation || 'MediAI Clinical Network'}
                        </div>
                      </div>
                    </div>

                    <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] rounded-xl shadow-xs transition-colors">
                      Chat Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
