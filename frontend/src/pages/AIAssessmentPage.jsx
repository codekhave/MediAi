import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { 
  Activity, CheckCircle2, ShieldAlert, AlertTriangle, 
  Pill, Stethoscope, ArrowRight, Loader2, RefreshCw, Clock,
  Calendar, MessageSquare, PhoneCall
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
    } catch (err) {
      setError('Failed to fetch follow-up questions.')
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
    } catch (err) {
      setError('Failed to complete AI assessment.')
    } finally {
      setLoading(false)
    }
  }

  // Determine Severity Tier and Badge styling
  const getSeverityInfo = (sev) => {
    const s = (sev || '').toUpperCase()
    if (s === 'EMERGENCY' || s === 'RED') {
      return {
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
        dotClass: 'bg-rose-500',
        label: 'Emergency Care (911 / ER)',
        isEmergency: true
      }
    }
    if (s === 'URGENT' || s === 'YELLOW') {
      return {
        badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
        dotClass: 'bg-amber-500',
        label: 'Urgent Care Recommended',
        isEmergency: false
      }
    }
    if (s === 'ROUTINE') {
      return {
        badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
        dotClass: 'bg-blue-500',
        label: 'Routine Consultation',
        isEmergency: false
      }
    }
    return {
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      dotClass: 'bg-emerald-500',
      label: 'Self-Care & Home Rest',
      isEmergency: false
    }
  }

  // Extract 2-3 clean clinical observations from result
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Clean Header & Step Flow */}
        <div className="text-center space-y-2 pb-2">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100">
            <Activity className="w-3.5 h-3.5" />
            Clinical Triage Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Health Assessment & Triage</h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Evidence-based symptom evaluation to clarify urgency, guide next steps, and connect with licensed care.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-center gap-3 py-1">
          <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            Symptoms
          </div>
          <div className="w-6 h-px bg-slate-200" />
          <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            Clarifications
          </div>
          <div className="w-6 h-px bg-slate-200" />
          <div className={`flex items-center gap-2 text-xs font-semibold ${step === 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            Assessment
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium p-3.5 rounded-xl">
            {error}
          </div>
        )}

        {/* STEP 1: SYMPTOM SELECTION */}
        {step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">What symptoms are you experiencing?</h2>
              <p className="text-xs text-slate-500 mt-1">Select one or more symptoms to begin clinical triage.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {symptoms.map((s) => {
                const isSelected = selectedSymptoms.includes(s.name)
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSymptom(s.name)}
                    className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <span>{s.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                )
              })}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Additional Notes or Description (Optional)
              </label>
              <textarea
                rows={3}
                value={symptomNotes}
                onChange={(e) => setSymptomNotes(e.target.value)}
                placeholder="Describe when symptoms started, how they behave with movement or posture, and previous medication..."
                className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={handleFetchQuestions}
              disabled={loading || selectedSymptoms.length === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue to Follow-up Questions'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: FOLLOW-UP QUESTIONS */}
        {step === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Follow-up Clarifications</h2>
              <p className="text-xs text-slate-500 mt-1">Please answer these questions to help our engine refine urgency and differential causes.</p>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <label className="block text-xs font-semibold text-slate-800">{idx + 1}. {q}</label>
                  <input
                    type="text"
                    placeholder="Your answer..."
                    value={answers[q] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleRunAssessment}
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Triage Assessment'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRIAGE RESULT - PRODUCTION DESIGN SYSTEM */}
        {step === 3 && result && (
          <div className="space-y-6">

            {/* Emergency Action Banner (Only visible if true Red-Flag EMERGENCY occurs) */}
            {sevInfo?.isEmergency && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start justify-between gap-3 text-rose-900">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-rose-950 block">Urgent Clinical Notice</span>
                    Your presentation indicates acute symptoms requiring immediate emergency department evaluation.
                  </div>
                </div>
                <a 
                  href="tel:911"
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold shrink-0 hover:bg-rose-700 flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call 911
                </a>
              </div>
            )}

            {/* Header & Status Card */}
            <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-slate-900">Triage Assessment</h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${sevInfo?.badgeClass}`}>
                  <span className={`w-2 h-2 rounded-full ${sevInfo?.dotClass}`} />
                  {result.severity_tier || sevInfo?.label}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {result.summary}
              </p>
            </section>

            {/* Clinical Breakdown: Consolidated Clinical Analysis Card */}
            <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">Clinical Analysis & Key Observations</h3>
                <span className="text-xs text-slate-400 font-medium">Differential Context</span>
              </div>

              <ul className="space-y-2.5 text-sm text-slate-600 list-disc pl-5">
                {observations.map((obs, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {obs}
                  </li>
                ))}
              </ul>

              {result.possible_conditions && result.possible_conditions.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold mr-1">Considerations:</span>
                  {result.possible_conditions.map((cond, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md">
                      {cond}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Action Guidance: Single Clean Card (Immediate Self-Care & Relief + Things to Avoid) */}
            <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-base font-semibold text-slate-800">Recommended Next Steps</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Immediate Self-Care & Relief */}
                <div>
                  <h4 className="text-sm font-semibold text-emerald-700 mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Immediate Self-Care & Relief
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {safeSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Things to Avoid */}
                <div>
                  <h4 className="text-sm font-semibold text-rose-700 mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    What to Avoid
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {avoidSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Supportive OTC Guidance */}
            {result.medication_recommendations && result.medication_recommendations.length > 0 && (
              <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    Supportive Over-The-Counter Guidance
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Non-Prescription Bridge</span>
                </div>

                <div className="space-y-3">
                  {result.medication_recommendations.map((med, idx) => (
                    <div key={idx} className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{med.name}</span>
                          {med.brand_examples && (
                            <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              eg: {med.brand_examples}
                            </span>
                          )}
                        </div>
                        {med.rxcui && (
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono font-medium self-start sm:self-auto">
                            RxNorm: {med.rxcui}
                          </span>
                        )}
                      </div>

                      {med.indication && (
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Indication:</span> {med.indication}
                        </p>
                      )}

                      {med.usage_guidance && (
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Usage & Dosage:</span> {med.usage_guidance}
                        </p>
                      )}

                      {med.precautions && (
                        <p className="text-xs text-amber-700 pt-0.5">
                          <span className="font-semibold">Caution:</span> {med.precautions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Verified Specialist Consultation */}
            {result.suggested_doctors && result.suggested_doctors.length > 0 && (
              <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-indigo-600" />
                    Recommended Medical Specialists
                  </h3>
                  <button 
                    onClick={() => navigate('/doctors')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    View All Specialists →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.suggested_doctors.map((doc) => (
                    <div key={doc.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between gap-3 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={doc.user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120'} 
                          alt={doc.user?.first_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">Dr. {doc.user?.first_name} {doc.user?.last_name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{doc.specialization_detail?.name || 'Physician'}</div>
                          <div className="text-[11px] font-semibold text-slate-700 mt-0.5">${doc.consultation_fee} Consultation</div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/doctors?doctor=${doc.id}`)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs shrink-0 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Restart Assessment Button */}
            <button
              onClick={() => { setStep(1); setSelectedSymptoms([]); setAnswers({}); setResult(null); }}
              className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              Start New Assessment
            </button>

            {/* Compliance Disclaimer */}
            <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-500 leading-relaxed text-center">
              <strong>Medical Disclaimer:</strong> {result.disclaimer}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
