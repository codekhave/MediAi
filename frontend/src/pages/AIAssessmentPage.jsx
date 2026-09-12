import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { 
  Activity, CheckCircle2, ShieldAlert, AlertTriangle, 
  Pill, Stethoscope, ArrowRight, Loader2, RefreshCw, Clock,
  Calendar, MessageSquare, PhoneCall, Sparkles, ShieldCheck, 
  Lock, ChevronLeft, AlertCircle, Check
} from 'lucide-react'

export default function AIAssessmentPage() {
  const [symptoms, setSymptoms] = useState([])
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [symptomNotes, setSymptomNotes] = useState('')
  const [step, setStep] = useState(1) // 1: Select, 2: Questions, 3: Result
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    fetchSymptoms()
  }, [])

  const fetchSymptoms = async () => {
    try {
      const res = await api.get('/ai/symptoms/')
      setSymptoms(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleSymptom = (name) => {
    if (selectedSymptoms.includes(name)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== name))
    } else {
      setSelectedSymptoms([...selectedSymptoms, name])
    }
  }

  const handleFetchQuestions = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom to proceed.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/ai/questions/', { symptoms: selectedSymptoms })
      setQuestions(res.data.questions || [])
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError('Failed to fetch follow-up questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRunAssessment = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/ai/assess/', {
        symptoms: selectedSymptoms,
        symptom_notes: symptomNotes,
        answers: answers
      })
      setResult(res.data)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError('Failed to complete AI assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Determine Severity Tier and Badge styling
  const getSeverityInfo = (sev) => {
    const s = (sev || '').toUpperCase()
    if (s === 'EMERGENCY' || s === 'RED') {
      return {
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200 ring-1 ring-rose-500/20',
        dotClass: 'bg-rose-500 animate-ping',
        solidDot: 'bg-rose-500',
        label: 'Emergency Care (911 / ER)',
        isEmergency: true
      }
    }
    if (s === 'URGENT' || s === 'YELLOW') {
      return {
        badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200 ring-1 ring-amber-500/20',
        dotClass: 'bg-amber-500',
        solidDot: 'bg-amber-500',
        label: 'Urgent Care Recommended',
        isEmergency: false
      }
    }
    if (s === 'ROUTINE') {
      return {
        badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200 ring-1 ring-indigo-500/20',
        dotClass: 'bg-indigo-500',
        solidDot: 'bg-indigo-500',
        label: 'Routine Consultation',
        isEmergency: false
      }
    }
    return {
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-500/20',
      dotClass: 'bg-emerald-500',
      solidDot: 'bg-emerald-500',
      label: 'Self-Care & Home Rest',
      isEmergency: false
    }
  }

  // Extract clinical observations
  const getClinicalObservations = () => {
    if (!result) return []
    if (result.clinical_observations && Array.isArray(result.clinical_observations) && result.clinical_observations.length > 0) {
      return result.clinical_observations.slice(0, 3)
    }
    if (result.clinical_reasoning && Array.isArray(result.clinical_reasoning)) {
      return result.clinical_reasoning.slice(0, 3).map(r => r.description || r.title || r)
    }
    if (result.possible_conditions && Array.isArray(result.possible_conditions)) {
      return result.possible_conditions.slice(0, 3).map(c => `Clinical indicator consistent with ${c}`)
    }
    return [result.summary]
  }

  const sevInfo = result ? getSeverityInfo(result.severity) : null
  const observations = result ? getClinicalObservations() : []

  const safeSteps = result?.what_to_do_and_not_do?.safe_supportive_actions || 
                    result?.supportive_actions_while_waiting?.immediate_actions || []

  const avoidSteps = result?.what_to_do_and_not_do?.strictly_avoid || 
                     result?.supportive_actions_while_waiting?.what_to_avoid || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 py-12 px-4 sm:px-6 lg:px-8 text-slate-900 flex flex-col justify-center">
      
      {/* Brand & Title Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 flex items-center justify-center mx-auto transition-transform hover:scale-105">
          <Activity className="w-6 h-6" />
        </div>
        
        <div className="inline-flex items-center gap-1.5 bg-purple-100/80 text-purple-700 text-xs font-bold px-3.5 py-1 rounded-full border border-purple-200/60 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Clinical Triage Engine</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Health Assessment & Triage
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Evidence-based symptom evaluation to clarify urgency, guide immediate self-care, and connect with licensed specialists.
        </p>
      </div>

      {/* Floating Boxed Card Container */}
      <div className="max-w-3xl w-full mx-auto">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-purple-900/5 rounded-3xl border border-purple-100 relative overflow-hidden">
          
          {/* Top Gradient Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500" />

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 pb-6 mb-6 border-b border-slate-100">
            {/* Step 1 */}
            <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${step >= 1 ? 'text-purple-700' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all ${
                step > 1 
                  ? 'bg-purple-600 text-white' 
                  : step === 1 
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-600' 
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {step > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
              </span>
              <span>Symptoms</span>
            </div>

            <div className={`w-8 sm:w-12 h-0.5 transition-colors ${step >= 2 ? 'bg-purple-600' : 'bg-slate-200'}`} />

            {/* Step 2 */}
            <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${step >= 2 ? 'text-purple-700' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all ${
                step > 2 
                  ? 'bg-purple-600 text-white' 
                  : step === 2 
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-600' 
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {step > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
              </span>
              <span>Clarifications</span>
            </div>

            <div className={`w-8 sm:w-12 h-0.5 transition-colors ${step >= 3 ? 'bg-purple-600' : 'bg-slate-200'}`} />

            {/* Step 3 */}
            <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${step === 3 ? 'text-purple-700' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all ${
                step === 3 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                3
              </span>
              <span>Triage Report</span>
            </div>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: SYMPTOM SELECTION                                                 */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">What symptoms are you experiencing?</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select one or more symptoms to begin clinical triage.</p>
                </div>
                {selectedSymptoms.length > 0 && (
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 self-start sm:self-auto">
                    {selectedSymptoms.length} selected
                  </span>
                )}
              </div>
              
              {/* Symptom Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {symptoms.map((s) => {
                  const isSelected = selectedSymptoms.includes(s.name)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSymptom(s.name)}
                      className={`p-3.5 rounded-2xl text-left border text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-50/90 border-purple-600 text-purple-950 shadow-sm ring-1 ring-purple-600/20' 
                          : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Additional Context Field */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Additional Notes or Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)}
                  placeholder="Describe when symptoms started, how severe they are, triggers, and any previous medications..."
                  className="w-full p-3.5 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleFetchQuestions}
                disabled={loading || selectedSymptoms.length === 0}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Clinical Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Clinical Follow-up</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: CLINICAL CLARIFICATIONS                                          */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Follow-up Clarifications</h2>
                <p className="text-xs text-slate-500 mt-0.5">Please answer these targeted questions to refine urgency and differential causes.</p>
              </div>

              <div className="space-y-3.5">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 leading-snug">
                      <span className="text-purple-600 mr-1.5">{idx + 1}.</span> {q}
                    </label>
                    <input
                      type="text"
                      placeholder="Type your response here..."
                      value={answers[q] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleRunAssessment}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Evidence-Based Triage...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Triage Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: TRIAGE RESULT REPORT                                              */}
          {/* ========================================================================= */}
          {step === 3 && result && (
            <div className="space-y-6">

              {/* Emergency Action Banner (If acute Red-Flag EMERGENCY) */}
              {sevInfo?.isEmergency && (
                <div className="bg-rose-50 border border-rose-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-950 shadow-xs">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-rose-950 block text-sm">Immediate Emergency Notice</span>
                      Your clinical indicators indicate acute presentation requiring immediate emergency evaluation.
                    </div>
                  </div>
                  <a 
                    href="tel:911"
                    className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 911 / ER Now</span>
                  </a>
                </div>
              )}

              {/* Status & Summary Block */}
              <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Clinical Triage Assessment</h2>
                    <span className="text-xs text-slate-400">Stratified via evidence-based diagnostic protocols</span>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto ${sevInfo?.badgeClass}`}>
                    <span className={`w-2 h-2 rounded-full ${sevInfo?.solidDot}`} />
                    {result.severity_tier || sevInfo?.label}
                  </span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed pt-1">
                  {result.summary}
                </p>
              </div>

              {/* Clinical Analysis & Differential Considerations */}
              <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Clinical Observations & Differential Analysis</h3>
                  <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">AI Diagnostic Logic</span>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  {observations.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-2" />
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>

                {result.possible_conditions && result.possible_conditions.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-bold mr-1">Differential Considerations:</span>
                    {result.possible_conditions.map((cond, idx) => (
                      <span key={idx} className="bg-white text-slate-800 text-xs font-semibold px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Guidance (Self-Care & Relief + What to Avoid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Immediate Self-Care & Relief */}
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Immediate Self-Care & Relief
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {safeSteps.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What to Avoid */}
                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 space-y-3">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    What to Avoid
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {avoidSteps.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Supportive OTC Guidance */}
              {result.medication_recommendations && result.medication_recommendations.length > 0 && (
                <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Pill className="w-4 h-4 text-purple-600" />
                      Supportive Over-The-Counter Guidance
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">Non-Prescription Bridge</span>
                  </div>

                  <div className="space-y-2.5">
                    {result.medication_recommendations.map((med, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">{med.name}</span>
                            {med.brand_examples && (
                              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                eg: {med.brand_examples}
                              </span>
                            )}
                          </div>
                          {med.rxcui && (
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-mono font-bold self-start sm:self-auto border border-purple-100">
                              RxNorm: {med.rxcui}
                            </span>
                          )}
                        </div>

                        {med.indication && (
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">Indication:</span> {med.indication}
                          </p>
                        )}

                        {med.usage_guidance && (
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">Dosage:</span> {med.usage_guidance}
                          </p>
                        )}

                        {med.precautions && (
                          <p className="text-xs text-amber-700 pt-0.5">
                            <span className="font-bold">Caution:</span> {med.precautions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Medical Specialists */}
              {result.suggested_doctors && result.suggested_doctors.length > 0 && (
                <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-purple-600" />
                      Recommended Verified Specialists
                    </h3>
                    <button 
                      type="button"
                      onClick={() => navigate('/doctors')}
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.suggested_doctors.map((doc) => (
                      <div key={doc.id} className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={doc.user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120'} 
                            alt={doc.user?.first_name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">Dr. {doc.user?.first_name} {doc.user?.last_name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{doc.specialization_detail?.name || 'Physician'}</div>
                            <div className="text-[11px] font-bold text-purple-700 mt-0.5">${doc.consultation_fee} Consultation</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/doctors?doctor=${doc.id}`)}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shrink-0 transition-all cursor-pointer"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => { setStep(1); setSelectedSymptoms([]); setAnswers({}); setResult(null); }}
                className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Start New Assessment</span>
              </button>

              {/* Clinical Compliance Disclaimer */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed text-center">
                <strong>Medical Disclaimer:</strong> {result.disclaimer || 'This AI tool provides triage guidance and health education. It is not a substitute for professional clinical medical advice or diagnosis.'}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TRUST BADGES FOOTER                                                      */}
          {/* ========================================================================= */}
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
              <span>Board-Certified Protocols</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
