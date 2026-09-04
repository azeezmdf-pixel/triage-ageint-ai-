import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  Clock,
  CheckCircle2,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Stethoscope,
  Filter,
  BarChart3,
  Ambulance,
} from 'lucide-react';
import { QueuePatient, HospitalStats, TriageTier } from '../types';

interface HospitalDashboardProps {
  queue: QueuePatient[];
  stats: HospitalStats;
  onResetQueue: () => void;
  onSelectPatient?: (patient: QueuePatient) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  queue,
  stats,
  onResetQueue,
  onSelectPatient,
}) => {
  const [filterTier, setFilterTier] = useState<string>('ALL');

  const filteredQueue = queue.filter((p) => {
    if (filterTier === 'ALL') return true;
    return p.tier === filterTier;
  });

  return (
    <div className="space-y-6">
      {/* Top Hospital Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Queue */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
              Active Queue
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {stats.activeQueueCount} Patients
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            All evaluated by 5-agent pipeline
          </p>
        </div>

        {/* Metric 2: Emergency Circuit Breaks */}
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Emergency Escalations
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-rose-900">
            {stats.emergencyEscalations} Immediate
          </div>
          <p className="text-xs text-rose-700 mt-1 font-medium">
            0 min delay • Direct to Trauma ED
          </p>
        </div>

        {/* Metric 3: Urgent Fast-Track */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Urgent Fast-Tracks
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-amber-900">
            {stats.urgentFastTrack} Prioritized
          </div>
          <p className="text-xs text-amber-700 mt-1 font-medium">
            Booked &lt; 24h (vs 5-day FCFS wait)
          </p>
        </div>

        {/* Metric 4: Prevented Delay Hours */}
        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 shadow-xs">
          <div className="flex items-center justify-between text-teal-700 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Critical Time Saved
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-teal-950">
            {stats.preventedDelayHours} Hours
          </div>
          <p className="text-xs text-teal-700 mt-1 font-medium">
            Delay prevented for acute patients
          </p>
        </div>
      </div>

      {/* Real-World Demonstration: First-Come-First-Served vs Agentic Prioritization */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <h3 className="text-base font-bold font-serif tracking-tight text-white">
                Queue Architecture: Traditional FCFS vs. Agentic Urgency Triage
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Solving the core challenge: preventing urgent patients from waiting behind mild cases
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            Automated Clinical Optimization
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs font-sans">
          {/* Card 1: Emergency */}
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-rose-500/40">
            <div className="flex items-center justify-between text-rose-400 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Ambulance className="w-4 h-4" />
                <span>Emergency Tier (ESI 1-2)</span>
              </span>
              <span className="font-mono text-[11px] bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                Chest Pain / Stroke
              </span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Traditional FCFS:</span>
                <span className="line-through text-rose-300 font-mono">3 to 5 days wait</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span className="text-emerald-400">Agentic Triage:</span>
                <span className="text-emerald-300 font-mono">0 min (Circuit Breaker ED)</span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
              Agent 3 triggers safety halt, preventing fatal home-waiting.
            </div>
          </div>

          {/* Card 2: Urgent */}
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-amber-500/40">
            <div className="flex items-center justify-between text-amber-400 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Urgent Tier (ESI 3-4)</span>
              </span>
              <span className="font-mono text-[11px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                High Fever / Deep Cut
              </span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Traditional FCFS:</span>
                <span className="line-through text-amber-300 font-mono">4 to 6 days wait</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span className="text-emerald-400">Agentic Triage:</span>
                <span className="text-emerald-300 font-mono">&lt; 24 - 48 hours</span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
              Agent 5 allocates reserved fast-track priority slots.
            </div>
          </div>

          {/* Card 3: Routine */}
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-teal-500/40">
            <div className="flex items-center justify-between text-teal-400 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Routine Tier (ESI 5)</span>
              </span>
              <span className="font-mono text-[11px] bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
                Sore Throat / Rash
              </span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Traditional FCFS:</span>
                <span className="text-slate-400 font-mono">First-in gets slot</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span className="text-teal-300">Agentic Triage:</span>
                <span className="text-teal-300 font-mono">Standard Outpatient (3-7d)</span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
              Safely routed without exhausting acute emergency capacity.
            </div>
          </div>
        </div>
      </div>

      {/* Patient Triage Queue Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                Hospital Triaging & Dispatch Queue
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Real-time patient classification across departments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {(['ALL', 'EMERGENCY', 'URGENT', 'ROUTINE'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                    filterTier === tier
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <button
              onClick={onResetQueue}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              title="Reset queue to demo seed data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Symptoms & Onset</th>
                <th className="px-4 py-3">Urgency Tier</th>
                <th className="px-4 py-3">Department / Destination</th>
                <th className="px-4 py-3">Scheduling Status</th>
                <th className="px-4 py-3 text-right">Wait Comparison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.map((patient) => {
                const isEmergency = patient.tier === 'EMERGENCY';
                const isUrgent = patient.tier === 'URGENT';

                return (
                  <tr
                    key={patient.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isEmergency ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Patient Name */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{patient.patientName}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {patient.id} • {patient.createdAt}
                      </div>
                    </td>

                    {/* Symptoms */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="truncate text-slate-900 font-medium">{patient.symptoms}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Onset: {patient.onset} • Severity: {patient.severity}/10
                      </div>
                    </td>

                    {/* Urgency Tier */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            isEmergency
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isUrgent
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {patient.tier}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ESI {patient.esiLevel}
                        </span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{patient.matchedDepartment}</div>
                      <div className="text-[11px] text-slate-500">{patient.matchedDoctor}</div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          isEmergency
                            ? 'bg-rose-600 text-white font-semibold shadow-xs'
                            : isUrgent
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isEmergency && <ShieldAlert className="w-3 h-3" />}
                        {patient.status}
                      </span>
                      {patient.scheduledTime && (
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {patient.scheduledTime}
                        </div>
                      )}
                    </td>

                    {/* Wait Comparison */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono text-xs">
                      {isEmergency ? (
                        <span className="text-emerald-600 font-bold">
                          0 min vs {patient.traditionalWaitDays}d FCFS
                        </span>
                      ) : isUrgent ? (
                        <span className="text-amber-700 font-medium">
                          {patient.agenticWaitHours}h vs {patient.traditionalWaitDays}d FCFS
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          {patient.agenticWaitHours / 24}d standard
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
