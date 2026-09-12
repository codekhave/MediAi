import React from 'react'
import { Activity, ShieldCheck, Lock, CheckCircle2, Globe, Heart, Stethoscope, FileText, PhoneCall } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-14 pb-10 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        
        {/* Column 1: Platform Branding & Clinical Standards (2 cols wide on LG) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-900/30">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Medi<span className="text-indigo-400">AI</span>
              <span className="ml-2 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                Telehealth
              </span>
            </span>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
            Enterprise-grade clinical intelligence and accredited telehealth platform connecting patients with board-certified physicians, AI-driven symptom triage, and end-to-end encrypted consultations.
          </p>

          <div className="space-y-2 pt-1 max-w-sm">
            <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-3 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-medium">256-Bit HIPAA Compliant & SOC-2 Architecture</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero-knowledge patient health records encryption</span>
            </div>
          </div>
        </div>

        {/* Column 2: Clinical Solutions */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
            <span>Clinical Solutions</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link to="/ai-assessment" className="hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                <span>AI Symptom Triage</span>
              </Link>
            </li>
            <li>
              <Link to="/doctors" className="hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                <span>Verified Specialists Directory</span>
              </Link>
            </li>
            <li>
              <Link to="/chat" className="hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                <span>Direct Physician Consult</span>
              </Link>
            </li>
            <li>
              <Link to="/appointments" className="hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                <span>Telehealth Video Rooms</span>
              </Link>
            </li>
            <li>
              <Link to="/emergency" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
                <span className="text-rose-400 font-medium">Emergency Duty Desk</span>
              </Link>
            </li>
            <li>
              <Link to="/community" className="hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                <span>Clinical Knowledge Feed</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Clinical Governance */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Governance & Quality</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
              <span>Board-Certified Physicians</span>
            </li>
            <li className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
              <span>Standardized Triage Protocols</span>
            </li>
            <li className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
              <span>Advisory Clinical Review</span>
            </li>
            <li className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
              <span>Differential Safety Checks</span>
            </li>
            <li className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
              <span>Secure Prescription Routing</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Compliance & Legal */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Compliance & Legal</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">
                HIPAA Notice of Privacy
              </span>
            </li>
            <li>
              <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">
                Terms of Telehealth Service
              </span>
            </li>
            <li>
              <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">
                Patient Bill of Rights
              </span>
            </li>
            <li>
              <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">
                Electronic Consent Guidelines
              </span>
            </li>
            <li>
              <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">
                Physician Credential Verification
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* Clinical Disclaimer Box */}
      <div className="max-w-7xl mx-auto mb-8 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Clinical Disclaimer:</strong> MediAI provides preliminary clinical symptom triage, teleconsultation dispatch, and educational health insights. AI outputs are supportive tools and do not substitute professional medical diagnosis. If you are experiencing life-threatening symptoms, immediately contact local emergency services.
        </p>
      </div>

      {/* Bottom Bar: Copyright & Real-Time Operational Health */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>© 2026 MediAI Health Technologies Inc. All rights reserved.</span>
        </div>

        {/* Live Operational Status */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">All Clinical Telehealth Systems Operational</span>
          <span className="text-slate-500">• 99.98% Uptime</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Engineered for accessible telehealth excellence</span>
          <Heart className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
        </div>
      </div>
    </footer>
  )
}
