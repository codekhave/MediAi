import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import api from '../services/api'
import { 
  Sparkles, Heart, Clock, Stethoscope, Search, Plus, 
  ThumbsUp, Share2, BookOpen, ShieldCheck, X, Loader2,
  Calendar, CheckCircle2, Award, ArrowRight, Video, 
  PlayCircle, DollarSign, Wallet, FileCheck, Eye, UserCheck, ExternalLink,
  Upload, Film
} from 'lucide-react'

// Clean, professional markdown-to-styled-HTML renderer (removes all '#' tags, formats lists, highlights clinical notes)
const renderFormattedArticle = (content) => {
  if (!content) return null

  const parseInline = (text) => {
    if (!text) return ''
    const parts = []
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
    let lastIdx = 0
    let match
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index))
      }
      const token = match[0]
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={lastIdx} className="font-bold text-slate-900">{token.slice(2, -2)}</strong>)
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={lastIdx} className="italic text-slate-700">{token.slice(1, -1)}</em>)
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(<code key={lastIdx} className="px-1.5 py-0.5 bg-slate-100 text-purple-700 rounded text-xs font-mono">{token.slice(1, -1)}</code>)
      }
      lastIdx = regex.lastIndex
    }
    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx))
    }
    return parts.length > 0 ? parts : text
  }

  const lines = content.split('\n')
  const elements = []
  let bulletBuffer = []
  let key = 0

  const flushBullets = () => {
    if (bulletBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${key++}`} className="space-y-2.5 my-3 pl-1">
          {bulletBuffer.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-slate-700 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 shrink-0" />
              <div className="flex-1">{parseInline(item)}</div>
            </li>
          ))}
        </ul>
      )
      bulletBuffer = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = raw.trim()

    if (!trimmed) {
      flushBullets()
      continue
    }

    // Check for bullets
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      bulletBuffer.push(trimmed.replace(/^[-*•]\s+/, ''))
      continue
    } else {
      flushBullets()
    }

    // Clean Headings: STRIP ALL '#' TAGS
    if (trimmed.startsWith('# ')) {
      const heading = trimmed.replace(/^#+\s*/, '')
      elements.push(
        <h2 key={`h1-${key++}`} className="text-xl sm:text-2xl font-black text-slate-900 mt-7 mb-3 pb-2 border-b border-purple-100 flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-600 rounded-full shrink-0" />
          <span>{parseInline(heading)}</span>
        </h2>
      )
    } else if (trimmed.startsWith('## ')) {
      const heading = trimmed.replace(/^#+\s*/, '')
      elements.push(
        <h3 key={`h2-${key++}`} className="text-lg sm:text-xl font-extrabold text-slate-900 mt-6 mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-purple-500 rounded-full shrink-0" />
          <span>{parseInline(heading)}</span>
        </h3>
      )
    } else if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      const heading = trimmed.replace(/^#+\s*/, '')
      elements.push(
        <h4 key={`h3-${key++}`} className="text-base sm:text-lg font-bold text-purple-950 mt-5 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-3 bg-purple-400 rounded-full shrink-0" />
          <span>{parseInline(heading)}</span>
        </h4>
      )
    } else if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${key++}`} className="my-6 border-slate-200" />)
    } else if (trimmed.startsWith('> ') || trimmed.toLowerCase().startsWith('clinical pearl:') || trimmed.toLowerCase().startsWith('clinical note:')) {
      const quote = trimmed.replace(/^>\s*/, '')
      elements.push(
        <div key={`quote-${key++}`} className="p-4 my-4 bg-purple-50/70 border-l-4 border-purple-600 rounded-r-2xl text-purple-950 text-xs sm:text-sm font-medium leading-relaxed shadow-sm">
          {parseInline(quote)}
        </div>
      )
    } else if (/^\d+\.\s+/.test(trimmed)) {
      // Numbered list item
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
      const num = numMatch ? numMatch[1] : '•'
      const text = numMatch ? numMatch[2] : trimmed
      elements.push(
        <div key={`num-${key++}`} className="flex items-start gap-3 my-2.5 pl-1">
          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            {num}
          </span>
          <div className="flex-1 text-slate-700 text-sm leading-relaxed">
            {parseInline(text)}
          </div>
        </div>
      )
    } else {
      // Regular paragraph
      elements.push(
        <p key={`p-${key++}`} className="text-slate-700 text-sm leading-relaxed my-2.5">
          {parseInline(trimmed)}
        </p>
      )
    }
  }

  flushBullets()
  return elements
}

export default function CommunityFeedPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeArticleModal, setActiveArticleModal] = useState(null)
  
  // Specialist Profile Modal
  const [selectedAuthorModal, setSelectedAuthorModal] = useState(null)
  const [loadingAuthor, setLoadingAuthor] = useState(false)

  // Publish Modal state (Strictly for Verified Specialists)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [videoUploadMode, setVideoUploadMode] = useState('upload') // 'upload' or 'url'
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'general',
    read_time: '4 min read',
    cover_image: '',
    video_url: '',
    author_type: user?.role === 'doctor' ? 'doctor' : 'contributor',
    author_role_badge: user?.role === 'doctor' ? 'Verified Physician' : 'Clinical Specialist',
    summary: '',
    content: ''
  })
  const [publishError, setPublishError] = useState('')

  // Creator Monetization Studio Modal state (Private to Creator)
  const [showCreatorStudio, setShowCreatorStudio] = useState(false)
  const [creatorData, setCreatorData] = useState(null)
  const [loadingCreator, setLoadingCreator] = useState(false)
  const [docUploadForm, setDocUploadForm] = useState({
    professional_title: '',
    bio: '',
    payout_bank_details: ''
  })
  const [payoutMessage, setPayoutMessage] = useState('')

  const isVerifiedSpecialist = user?.role === 'doctor' || creatorData?.metrics?.is_eligible

  const categories = [
    { id: 'all', label: 'All Guides', icon: Sparkles },
    { id: 'nutrition', label: 'Clinical Nutrition & Diet', icon: BookOpen },
    { id: 'fitness', label: 'Movement & Longevity', icon: Award },
    { id: 'heart', label: 'Cardiovascular Health', icon: Heart },
    { id: 'sleep', label: 'Sleep & Recovery', icon: Clock },
    { id: 'mental_health', label: 'Mental Wellness & Mind', icon: Heart },
    { id: 'videos', label: 'Video Demonstrations', icon: Video },
  ]

  useEffect(() => {
    fetchArticles()
    if (user) {
      checkCreatorEligibility()
    }
  }, [selectedCategory, user])

  const checkCreatorEligibility = async () => {
    try {
      const res = await api.get('/community/creator/dashboard/')
      setCreatorData(res.data)
    } catch (err) {
      // Non-creator regular patient
    }
  }

  const fetchArticles = async () => {
    setLoading(true)
    try {
      let url = '/community/articles/'
      const params = []
      if (selectedCategory !== 'all') params.push(`category=${selectedCategory}`)
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`)
      if (params.length > 0) url += `?${params.join('&')}`

      const res = await api.get(url)
      setArticles(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchArticles()
  }

  const handleArticleClick = async (art) => {
    setActiveArticleModal(art)
    try {
      const res = await api.get(`/community/articles/${art.id}/`)
      setActiveArticleModal(res.data)
      setArticles(prev => prev.map(a => a.id === art.id ? res.data : a))
    } catch (err) {
      console.error(err)
    }
  }

  const handleAuthorClick = async (art, e) => {
    e.stopPropagation()
    const authorId = art.author_doctor_id || art.creator_user || art.author
    if (!authorId) {
      setSelectedAuthorModal({
        name: art.author_name,
        title: art.author_specialization || 'Clinical Specialist',
        hospital: art.author_hospital || 'MediAI Clinical Network',
        bio: art.author_bio || 'Dedicated medical professional focused on evidence-based preventative health.',
        avatar: art.author_avatar,
        rating: art.author_rating || '4.95',
        doctor_id: art.author_doctor_id,
        is_verified: true,
        articles: articles.filter(a => a.author_name === art.author_name)
      })
      return
    }

    setLoadingAuthor(true)
    setSelectedAuthorModal({
      name: art.author_name,
      title: art.author_specialization,
      hospital: art.author_hospital,
      bio: art.author_bio,
      avatar: art.author_avatar,
      rating: art.author_rating || '4.95',
      doctor_id: art.author_doctor_id,
      is_verified: true,
      articles: []
    })

    try {
      const res = await api.get(`/community/authors/${authorId}/`)
      setSelectedAuthorModal(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAuthor(false)
    }
  }

  const handleToggleLike = async (articleId, e) => {
    e.stopPropagation()
    if (!user) {
      alert('Please log in to like this health article.')
      navigate('/login')
      return
    }

    try {
      const res = await api.post(`/community/articles/${articleId}/like/`)
      setArticles(prev => prev.map(art => {
        if (art.id === articleId) {
          return {
            ...art,
            is_liked: res.data.is_liked,
            likes_count: res.data.likes_count
          }
        }
        return art
      }))
      if (activeArticleModal && activeArticleModal.id === articleId) {
        setActiveArticleModal(prev => ({
          ...prev,
          is_liked: res.data.is_liked,
          likes_count: res.data.likes_count
        }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenCreatorStudio = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setShowCreatorStudio(true)
    setLoadingCreator(true)
    try {
      const res = await api.get('/community/creator/dashboard/')
      setCreatorData(res.data)
      setDocUploadForm({
        professional_title: res.data.creator_profile.professional_title || '',
        bio: res.data.creator_profile.bio || '',
        payout_bank_details: res.data.creator_profile.payout_bank_details || ''
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingCreator(false)
    }
  }

  const handleSaveCreatorDocs = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/community/creator/dashboard/', {
        action: 'upload_documents',
        ...docUploadForm
      })
      setCreatorData(prev => ({ ...prev, creator_profile: res.data.profile }))
      alert('Your specialist credentials and payout details were saved successfully!')
    } catch (err) {
      console.error(err)
    }
  }

  const handleRequestPayout = async () => {
    try {
      const res = await api.post('/community/creator/dashboard/', {
        action: 'request_payout'
      })
      setPayoutMessage(res.data.message)
      const fresh = await api.get('/community/creator/dashboard/')
      setCreatorData(fresh.data)
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to process withdrawal request.')
    }
  }

  const handlePublishSubmit = async (e) => {
    e.preventDefault()
    setPublishing(true)
    setPublishError('')

    try {
      const formData = new FormData()
      formData.append('title', articleForm.title)
      formData.append('category', articleForm.category)
      formData.append('read_time', articleForm.read_time)
      formData.append('cover_image', articleForm.cover_image)
      formData.append('summary', articleForm.summary)
      formData.append('content', articleForm.content)
      formData.append('author_type', articleForm.author_type)
      formData.append('author_role_badge', articleForm.author_role_badge)

      if (videoUploadMode === 'upload' && videoFile) {
        formData.append('video_file', videoFile)
      } else if (articleForm.video_url) {
        formData.append('video_url', articleForm.video_url)
      }

      const res = await api.post('/community/articles/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setArticles(prev => [res.data, ...prev])
      setShowPublishModal(false)
      setArticleForm({
        title: '',
        category: 'general',
        read_time: '4 min read',
        cover_image: '',
        video_url: '',
        author_type: user?.role === 'doctor' ? 'doctor' : 'contributor',
        author_role_badge: user?.role === 'doctor' ? 'Verified Physician' : 'Clinical Specialist',
        summary: '',
        content: ''
      })
      setVideoFile(null)
      setVideoPreview('')
      alert('Your clinical article and video guide were published successfully!')
    } catch (err) {
      setPublishError(err.response?.data?.error || 'Only verified specialists may publish articles.')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24">
      
      {/* Sleek, Spacious Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
              <Sparkles className="w-3.5 h-3.5" />
              Evidence-Based Lifestyle Medicine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Health & Wellness Journal
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              Clinical guides, nutrition protocols, and video tutorials authored by verified medical doctors, psychologists, and specialists.
            </p>
          </div>

          {/* Action buttons (Only for verified doctors or creators) */}
          <div className="flex items-center gap-3 shrink-0">
            {isVerifiedSpecialist && (
              <>
                <button
                  onClick={handleOpenCreatorStudio}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 transition-all"
                >
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  Creator Studio
                </button>

                <button
                  onClick={() => setShowPublishModal(true)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Publish Guide or Video
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar & Clean Category Pills */}
        <div className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Horizontal Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
              {categories.map(cat => {
                const Icon = cat.icon
                const isSelected = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-purple-700 border border-slate-200/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, nutrition, doctors..."
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none shadow-sm"
              />
            </form>
          </div>
        </div>

      </div>

      {/* Main Content Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Curating verified specialist guides...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3 max-w-md mx-auto my-12">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Guides Found</h3>
            <p className="text-xs text-slate-500">There are no guides in this topic yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <div 
                key={art.id}
                onClick={() => handleArticleClick(art)}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden group"
              >
                {/* Cover Image or Video Preview */}
                <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                  <img 
                    src={art.cover_image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800'} 
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {art.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Video Play Badge */}
                  {art.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 group-hover:bg-slate-900/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-7 h-7" />
                      </div>
                    </div>
                  )}

                  {/* Read / Watch Time */}
                  <div className="absolute bottom-3 right-3">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      {art.video_url ? <Video className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-purple-300" />}
                      {art.read_time}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-purple-600 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  {/* Author Row (Clickable to Open Specialist Profile) */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div 
                        onClick={(e) => handleAuthorClick(art, e)}
                        className="flex items-center gap-2.5 group/author hover:opacity-80 transition-opacity"
                        title="Click to view specialist profile"
                      >
                        <img 
                          src={art.author_avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100'} 
                          alt={art.author_name}
                          className="w-8 h-8 rounded-full object-cover border border-purple-200 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <span>{art.author_name}</span>
                            <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" title="Verified Specialist" />
                          </div>
                          <div className="text-[10px] text-purple-700 font-semibold group-hover/author:underline">
                            {art.author_specialization}
                          </div>
                        </div>
                      </div>

                      {/* Like button */}
                      <button
                        onClick={(e) => handleToggleLike(art.id, e)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
                          art.is_liked
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-slate-50 text-slate-500 hover:bg-purple-50 hover:text-purple-600 border border-slate-200/80'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${art.is_liked ? 'fill-rose-600 text-rose-600' : ''}`} />
                        <span>{art.likes_count}</span>
                      </button>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {art.views_count} views
                      </span>

                      <span className="text-purple-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        {art.video_url ? 'Watch Video' : 'Read Guide'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Discreet footer notice for accreditation */}
        <div className="mt-16 text-center text-xs text-slate-400">
          MediAI verified articles and protocols are authored by certified physicians and licensed practitioners.{' '}
          <Link to="/doctors" className="text-purple-600 font-bold hover:underline">
            Explore our verified specialist directory →
          </Link>
        </div>

      </div>

      {/* SPECIALIST / AUTHOR PROFILE MODAL */}
      {selectedAuthorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-purple-100 animate-in fade-in">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedAuthorModal.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160'} 
                  alt={selectedAuthorModal.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-200 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-lg font-black text-slate-900">{selectedAuthorModal.name}</h2>
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" title="Verified Medical Specialist" />
                  </div>
                  <div className="text-xs font-bold text-purple-700">{selectedAuthorModal.title}</div>
                  <div className="text-[11px] text-slate-500">{selectedAuthorModal.hospital}</div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedAuthorModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Specialist Clinical Bio */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
              <span className="font-bold text-slate-700">Clinical Focus & Background:</span>
              <p className="text-slate-600 leading-relaxed">
                {selectedAuthorModal.bio || "Dedicated healthcare clinician focused on evidence-based lifestyle medicine, disease prevention, and patient care."}
              </p>
            </div>

            {/* Authored Guides / Tutorials */}
            {selectedAuthorModal.articles && selectedAuthorModal.articles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Published Guides by {selectedAuthorModal.name}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedAuthorModal.articles.map(article => (
                    <div 
                      key={article.id}
                      onClick={() => {
                        setSelectedAuthorModal(null)
                        handleArticleClick(article)
                      }}
                      className="p-3 bg-white hover:bg-purple-50 rounded-xl border border-slate-200/80 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="pr-3">
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">{article.title}</div>
                        <div className="text-[10px] text-slate-400">{article.read_time} • {article.likes_count} likes</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedAuthorModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Profile
              </button>

              <button
                onClick={() => {
                  const docId = selectedAuthorModal.doctor_id
                  setSelectedAuthorModal(null)
                  if (docId) {
                    navigate(`/doctors?doctor=${docId}`)
                  } else {
                    navigate('/doctors')
                  }
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Telehealth Consultation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ARTICLE / VIDEO READER MODAL */}
      {activeArticleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100 animate-in fade-in">
            
            {/* Header / Media */}
            <div className="relative">
              {(activeArticleModal.video_file || activeArticleModal.video_url) ? (
                <div className="w-full aspect-video bg-black rounded-t-3xl overflow-hidden relative">
                  {activeArticleModal.video_url && (activeArticleModal.video_url.includes('youtube.com') || activeArticleModal.video_url.includes('youtu.be')) ? (
                    <iframe 
                      className="w-full h-full"
                      src={activeArticleModal.video_url.includes('youtube.com') || activeArticleModal.video_url.includes('youtu.be')
                        ? `https://www.youtube.com/embed/${activeArticleModal.video_url.split('v=')[1]?.split('&')[0] || activeArticleModal.video_url.split('/').pop()}`
                        : activeArticleModal.video_url}
                      title={activeArticleModal.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      className="w-full h-full object-contain"
                      controls
                      autoPlay={false}
                      src={activeArticleModal.video_file || activeArticleModal.video_url}
                      poster={activeArticleModal.cover_image}
                    >
                      Your browser does not support HTML5 video streaming.
                    </video>
                  )}
                </div>
              ) : (
                <div className="h-64 sm:h-80 w-full overflow-hidden rounded-t-3xl relative">
                  <img 
                    src={activeArticleModal.cover_image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1000'} 
                    alt={activeArticleModal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-4 left-6 right-6">
                    <span className="bg-purple-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                      {activeArticleModal.category.replace('_', ' ')}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {activeArticleModal.title}
                    </h2>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setActiveArticleModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reader Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Author & Booking Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div 
                  onClick={(e) => handleAuthorClick(activeArticleModal, e)}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img 
                    src={activeArticleModal.author_avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120'} 
                    alt={activeArticleModal.author_name}
                    className="w-11 h-11 rounded-full object-cover border border-purple-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>{activeArticleModal.author_name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    </div>
                    <div className="text-[11px] text-purple-700 font-semibold">
                      {activeArticleModal.author_specialization} • {activeArticleModal.author_hospital || 'Medical Center'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const docId = activeArticleModal.author_doctor_id
                    setActiveArticleModal(null)
                    if (docId) {
                      navigate(`/doctors?doctor=${docId}`)
                    } else {
                      navigate('/doctors')
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Specialist
                </button>
              </div>


              {/* Clean Professional Formatted Content (No '#' hashtags, structured headings, bullet points, clinical cards) */}
              <div className="space-y-4 text-slate-700 leading-relaxed">
                {renderFormattedArticle(activeArticleModal.content)}
              </div>

              {/* Clinical Educational Disclaimer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Evidence-Based Clinical Guidance Disclaimer
                </div>
                <p>
                  The protocols and educational information in this article are authored for health literacy and preventative wellness. They do not constitute formal diagnostic prescription. For acute conditions or customized medical treatment, consult with a licensed doctor.
                </p>
              </div>

              {/* Bottom Reader Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={(e) => handleToggleLike(activeArticleModal.id, e)}
                  className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-bold transition-all ${
                    activeArticleModal.is_liked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-purple-600 border border-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${activeArticleModal.is_liked ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{activeArticleModal.likes_count} Helpful Likes</span>
                </button>

                <button
                  onClick={() => setActiveArticleModal(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Close Reader
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* PRIVATE CREATOR MONETIZATION STUDIO MODAL */}
      {showCreatorStudio && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-purple-100 animate-in fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  Specialist Creator Studio
                </h2>
                <p className="text-xs text-slate-500">Private earnings dashboard and credential verification for healthcare creators.</p>
              </div>
              <button 
                onClick={() => setShowCreatorStudio(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingCreator ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading your private creator metrics...</div>
            ) : creatorData ? (
              <div className="space-y-6">
                
                {payoutMessage && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                    {payoutMessage}
                  </div>
                )}

                {/* Private Earnings Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                    <div className="text-2xl font-extrabold text-slate-900">{creatorData.metrics.total_views}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Article Reads</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                    <div className="text-2xl font-extrabold text-rose-600">{creatorData.metrics.total_likes}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Helpful Likes</div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
                    <div className="text-2xl font-extrabold text-emerald-700">${creatorData.metrics.total_earned}</div>
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Total Earned</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-center">
                    <div className="text-2xl font-extrabold text-purple-700">${creatorData.metrics.pending_payout}</div>
                    <div className="text-[10px] font-bold text-purple-800 uppercase">Pending Balance</div>
                  </div>
                </div>

                {/* Eligibility & Withdrawal Action */}
                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs bg-slate-50">
                  <div>
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      Monetization Status:
                      {creatorData.metrics.is_eligible ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Verified & Active
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">Pending Document Verification</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Earn $0.02 per verified article read + $0.05 per active reader endorsement.
                    </p>
                  </div>

                  <button
                    onClick={handleRequestPayout}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow text-xs shrink-0"
                  >
                    Withdraw Funds
                  </button>
                </div>

                {/* Credentials & Payout Form */}
                <form onSubmit={handleSaveCreatorDocs} className="space-y-4 text-xs border-t border-slate-100 pt-4">
                  <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    Specialist Verification & Direct Deposit Info
                  </h3>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Professional Title & Specialty</label>
                    <input
                      type="text"
                      value={docUploadForm.professional_title}
                      onChange={(e) => setDocUploadForm({ ...docUploadForm, professional_title: e.target.value })}
                      placeholder="e.g. Board-Certified Cardiologist, Licensed Clinical Psychologist, Clinical Dietitian"
                      className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Direct Bank Payout Details (Routing / Account)</label>
                    <input
                      type="text"
                      value={docUploadForm.payout_bank_details}
                      onChange={(e) => setDocUploadForm({ ...docUploadForm, payout_bank_details: e.target.value })}
                      placeholder="e.g. Chase Bank, Routing: 123456789, Account: 987654321"
                      className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow text-xs"
                    >
                      Update Creator Profile
                    </button>
                  </div>
                </form>

              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* PUBLISHING MODAL (GATED TO VERIFIED SPECIALISTS) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-purple-100 animate-in fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  Publish Clinical Guide or Video Tutorial
                </h2>
                <p className="text-xs text-slate-500">Only verified healthcare professionals and credentialed specialists can publish.</p>
              </div>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {publishError && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl border border-rose-200">
                {publishError}
              </div>
            )}

            <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. Clinical Protocols for Autonomic Nervous System Recovery"
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="nutrition">Clinical Nutrition & Diet</option>
                    <option value="fitness">Movement & Longevity</option>
                    <option value="heart">Cardiovascular Health</option>
                    <option value="sleep">Sleep & Recovery</option>
                    <option value="mental_health">Mental Wellness & Mind</option>
                    <option value="videos">Video Demonstration</option>
                    <option value="general">General Health Tips</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Read / Watch Duration</label>
                  <input
                    type="text"
                    value={articleForm.read_time}
                    onChange={(e) => setArticleForm({ ...articleForm, read_time: e.target.value })}
                    placeholder="e.g. 4 min read or 6 min watch"
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  value={articleForm.cover_image}
                  onChange={(e) => setArticleForm({ ...articleForm, cover_image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Enhanced Video Upload & Embed Section */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-purple-600" />
                    Doctor Video Demonstration / Tutorial
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setVideoUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all ${videoUploadMode === 'upload' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-purple-600'}`}
                    >
                      Upload Video File
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all ${videoUploadMode === 'url' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-purple-600'}`}
                    >
                      Video Web Link
                    </button>
                  </div>
                </div>

                {videoUploadMode === 'upload' ? (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white rounded-xl p-4 text-center cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            setVideoFile(file)
                            setVideoPreview(URL.createObjectURL(file))
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                        <Upload className="w-6 h-6 text-purple-600 mb-1" />
                        <span className="font-bold text-slate-800 text-xs">
                          {videoFile ? videoFile.name : 'Click or Drag & Drop to Upload Video (MP4, WebM)'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB selected` : 'Record yourself demonstrating health protocols or wellness tips'}
                        </span>
                      </div>
                    </div>
                    {videoPreview && (
                      <div className="rounded-xl overflow-hidden aspect-video bg-black max-h-44 mx-auto">
                        <video src={videoPreview} controls className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={articleForm.video_url}
                    onChange={(e) => setArticleForm({ ...articleForm, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 URL"
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Lead Excerpt / Summary</label>
                <textarea
                  rows={2}
                  required
                  value={articleForm.summary}
                  onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                  placeholder="2-3 sentence overview of findings for the feed card..."
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Clinical Article Body & Protocols</label>
                <textarea
                  rows={6}
                  required
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="In-depth clinical protocols, biochemical rationale, and practical steps..."
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  {publishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Publish Specialist Guide
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
