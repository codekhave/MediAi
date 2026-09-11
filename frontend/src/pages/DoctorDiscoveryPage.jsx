import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { 
  Stethoscope, Search, Star, Calendar, Clock, 
  Hospital, CheckCircle2, ShieldCheck, X, ArrowRight 
} from 'lucide-react'

export default function DoctorDiscoveryPage() {
  const [searchParams] = useSearchParams()
  const preselectedDoctorId = searchParams.get('doctor')

  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [search, setSearch] = useState('')
  const [selectedSpec, setSelectedSpec] = useState('')
  const [loading, setLoading] = useState(true)

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const [bookingData, setBookingData] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    start_time: '10:00:00',
    end_time: '10:30:00',
    reason: '',
    appointment_type: 'video'
  })
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSpecializations()
    fetchDoctors()
  }, [search, selectedSpec])

  const fetchSpecializations = async () => {
    try {
      const res = await api.get('/auth/specializations/')
      setSpecializations(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      let url = `/auth/doctors/?search=${search}`
      if (selectedSpec) url += `&specialization=${selectedSpec}`
      const res = await api.get(url)
      setDoctors(res.data)

      // Auto open booking modal if preselected doctor query param is provided
      if (preselectedDoctorId && !bookingDoctor) {
        const found = res.data.find(d => String(d.id) === String(preselectedDoctorId))
        if (found) {
          setBookingDoctor(found)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  const handleBookAppointment = async (e) => {
    e.preventDefault()
    setBookingError('')
    setBookingSuccess('')
    setSubmitting(true)

    try {
      await api.post('/appointments/', {
        doctor: bookingDoctor.id,
        date: bookingData.date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        reason: bookingData.reason || 'General Telehealth Consultation',
        appointment_type: bookingData.appointment_type,
      })
      setBookingSuccess('Appointment requested successfully! Redirecting to appointments...')
      setTimeout(() => {
        setBookingDoctor(null)
        setBookingSuccess('')
      }, 2000)
    } catch (err) {
      setBookingError(err.response?.data?.date?.[0] || err.response?.data?.doctor?.[0] || 'Booking failed. Please select a future date.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
            <Stethoscope className="w-4 h-4" />
            Verified Medical Practitioner Directory
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Find & Book Top Doctors
          </h1>
          <p className="text-slate-600 text-sm">
            All listed specialists undergo credential verification by platform administrators.
          </p>
        </div>

        {/* Search & Specialization Filters */}
        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-md space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by doctor name, specialization, or hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setSelectedSpec('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedSpec === '' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Specializations
            </button>
            {specializations.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setSelectedSpec(spec.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedSpec === spec.id ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading verified doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
            No approved doctors found matching search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                        alt={doc.user?.full_name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
                      />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1">
                          Dr. {doc.user?.first_name} {doc.user?.last_name}
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                        </h3>
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          {doc.specialization_detail?.name || 'General Practitioner'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doc.bio || `${doc.years_of_experience} years of clinical experience.`}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Hospital className="w-3.5 h-3.5 text-purple-600" />
                      <span className="truncate">{doc.hospital_affiliation || 'General Clinic'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating} ({doc.total_reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                    <span className="text-lg font-extrabold text-slate-900">${doc.consultation_fee}</span>
                  </div>
                  <button
                    onClick={() => setBookingDoctor(doc)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-purple-200 transition-all"
                  >
                    Book Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {bookingDoctor && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
              <button
                onClick={() => setBookingDoctor(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Book Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  Dr. {bookingDoctor.user?.first_name} {bookingDoctor.user?.last_name} ({bookingDoctor.specialization_detail?.name})
                </p>
              </div>

              {bookingSuccess && (
                <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl border border-emerald-200">
                  {bookingSuccess}
                </div>
              )}

              {bookingError && (
                <div className="bg-rose-50 text-rose-800 text-xs font-bold p-3 rounded-xl border border-rose-200">
                  {bookingError}
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={bookingData.start_time}
                      onChange={(e) => setBookingData({ ...bookingData, start_time: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={bookingData.end_time}
                      onChange={(e) => setBookingData({ ...bookingData, end_time: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reason for Visit</label>
                  <textarea
                    rows={2}
                    required
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                    placeholder="Describe main reason for consultation..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div className="text-xs">
                    <span className="text-slate-400 block font-bold">Total Fee</span>
                    <span className="text-base font-extrabold text-purple-700">${bookingDoctor.consultation_fee}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Booking...' : 'Confirm Request'}
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
