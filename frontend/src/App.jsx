import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PatientDashboard from './pages/PatientDashboard'
import AIAssessmentPage from './pages/AIAssessmentPage'
import DoctorDiscoveryPage from './pages/DoctorDiscoveryPage'
import AppointmentsPage from './pages/AppointmentsPage'
import VideoConsultationPage from './pages/VideoConsultationPage'
import ChatPage from './pages/ChatPage'
import EmergencyPage from './pages/EmergencyPage'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CommunityFeedPage from './pages/CommunityFeedPage'

function AppContent() {
  const location = useLocation()
  const isFullScreenApp = location.pathname === '/chat' || location.pathname.startsWith('/room/')

  return (
    <div className={`flex flex-col ${isFullScreenApp ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <main className={`flex-1 ${isFullScreenApp ? 'h-[calc(100vh-4rem)] overflow-hidden' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/doctors" element={<DoctorDiscoveryPage />} />
          <Route path="/community" element={<CommunityFeedPage />} />
          <Route path="/wellness" element={<CommunityFeedPage />} />

          {/* Patient Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/ai-assessment" element={<AIAssessmentPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
          </Route>

          {/* Shared Authenticated Routes (Patient, Doctor, Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']} />}>
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/room/:id" element={<VideoConsultationPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>

          {/* Doctor Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
      {!isFullScreenApp && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
