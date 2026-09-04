import React from 'react';
import { ShieldAlert, Activity, Stethoscope, Users, FileText, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'intake' | 'dashboard' | 'protocol';
  onTabChange: (tab: 'intake' | 'dashboard' | 'protocol') => void;
  queueCount: number;
  emergencyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  queueCount,
  emergencyCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top hospital announcement bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40">
            HLT-02 TRACK
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="text-slate-300 font-medium truncate">
            Triage Scheduling Agent • 5-Agent Multi-Agent Clinical Architecture
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden md:inline">5 Agents Armed</span>
          </div>
          {emergencyCount > 0 && (
            <div className="flex items-center gap-1 text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>{emergencyCount} Emergency Escalated</span>
            </div>
          )}
        </div>
      </div>

      {/* Main branding & navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-600/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
                  TriageAI
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider rounded bg-teal-50 text-teal-700 border border-teal-200">
                  Hospital System
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Agentic Symptom Categorization, Emergency Safety Halt & Urgency-Weighted Scheduling
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              id="tab-intake-btn"
              onClick={() => onTabChange('intake')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'intake'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Patient Intake</span>
            </button>

            <button
              id="tab-dashboard-btn"
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                activeTab === 'dashboard'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Care Team Queue</span>
              {queueCount > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-xs font-mono font-semibold ${
                    activeTab === 'dashboard'
                      ? 'bg-teal-900 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {queueCount}
                </span>
              )}
            </button>

            <button
              id="tab-protocol-btn"
              onClick={() => onTabChange('protocol')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'protocol'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Protocol & Agents</span>
              <span className="md:hidden">Info</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
