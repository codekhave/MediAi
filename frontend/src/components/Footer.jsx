import React from 'react'
import { Activity, ShieldCheck, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-purple-900/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Medi<span className="text-purple-400">AI</span></span>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Next-generation AI-assisted telehealth platform unifying preliminary symptom assessment, verified specialist discovery, instant video consultations, and emergency triage.
          </p>
          <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/60 border border-purple-800/40 p-2.5 rounded-lg max-w-md">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>AI assessment outputs are for informational triage only and do not replace formal clinical diagnosis.</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-purple-300 mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><a href="/ai-assessment" className="hover:text-purple-400 transition-colors">AI Symptom Check</a></li>
            <li><a href="/doctors" className="hover:text-purple-400 transition-colors">Search Verified Doctors</a></li>
            <li><a href="/appointments" className="hover:text-purple-400 transition-colors">Book Consultations</a></li>
            <li><a href="/emergency" className="hover:text-purple-400 transition-colors">Emergency Duty Doctor</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-purple-300 mb-3">Project Information</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            MediAI Web Telehealth Platform<br />
            Caritas University Department of Computer Science<br />
            Built with Django REST Framework, React 19, Simple JWT & Tailwind CSS.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <div>© 2026 MediAI Telehealth Platform. All rights reserved.</div>
        <div className="flex items-center gap-1 mt-2 sm:mt-0">
          <span>Designed with care for healthcare accessibility</span>
          <Heart className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
        </div>
      </div>
    </footer>
  )
}
