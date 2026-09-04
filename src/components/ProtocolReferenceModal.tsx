import React from 'react';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  AlertTriangle,
  Stethoscope,
  X,
  ArrowRight,
  Workflow,
} from 'lucide-react';
import { CLINICAL_RULES } from '../data/clinicalProtocols';

interface ProtocolReferenceModalProps {
  onClose: () => void;
}

export const ProtocolReferenceModal: React.FC<ProtocolReferenceModalProps> = ({ onClose }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-teal-700 font-mono text-xs font-semibold mb-1">
          <Workflow className="w-4 h-4" />
          <span>HLT-02 SPECIFICATION & CLINICAL REFERENCE</span>
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-900">
          5-Agent Architecture & Triage Protocols
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          How autonomous AI agents analyze symptoms, enforce Manchester / ESI safety rules, and optimize hospital appointment scheduling.
        </p>
      </div>

      {/* 5-Agent Architecture Overview */}
      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-teal-600" />
          <span>The 5-Agent Multi-Agent Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-sans">
          {/* Agent 1 */}
          <div className="p-3.5 rounded-lg bg-sky-50/70 border border-sky-200 flex flex-col justify-between">
            <div>
              <div className="font-mono font-bold text-sky-800 text-[11px] mb-1">
                AGENT 01
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Patient Interaction</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Empathetic intake conversational agent. Normalizes unstructured narrative, extracts cardinal symptoms, onset time, and severity score.
              </p>
            </div>
            <div className="mt-2 text-[10px] font-mono text-sky-700 font-semibold">
              Output: Structured Intake Entity
            </div>
          </div>

          {/* Agent 2 */}
          <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between">
            <div>
              <div className="font-mono font-bold text-indigo-800 text-[11px] mb-1">
                AGENT 02
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Triage Protocol</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Evaluates intake against rule sets (Manchester Triage &amp; ESI Level 1-5). Evaluates vital threats and organ system compromise.
              </p>
            </div>
            <div className="mt-2 text-[10px] font-mono text-indigo-700 font-semibold">
              Output: Urgency Tier &amp; ESI Score
            </div>
          </div>

          {/* Agent 3 */}
          <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-300 flex flex-col justify-between ring-1 ring-rose-300">
            <div>
              <div className="font-mono font-bold text-rose-800 text-[11px] mb-1 flex items-center gap-1">
                <span>AGENT 03</span>
                <span className="bg-rose-600 text-white px-1 py-0.2 rounded text-[9px]">
                  CIRCUIT BREAKER
                </span>
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Emergency Escalation</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Safety watchdog. If Emergency detected, immediately HALTS routine scheduling, triggers 911 dispatch and alerts ED Trauma bay.
              </p>
            </div>
            <div className="mt-2 text-[10px] font-mono text-rose-700 font-semibold">
              Output: Halt Signal OR Clearance
            </div>
          </div>

          {/* Agent 4 */}
          <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-200 flex flex-col justify-between">
            <div>
              <div className="font-mono font-bold text-teal-800 text-[11px] mb-1">
                AGENT 04
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Specialist Matching</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Directs non-emergency patients to optimal medical specialty (Cardiology, Pulmonology, Ortho, Surgery) and physician.
              </p>
            </div>
            <div className="mt-2 text-[10px] font-mono text-teal-700 font-semibold">
              Output: Department &amp; Doctor Match
            </div>
          </div>

          {/* Agent 5 */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
            <div>
              <div className="font-mono font-bold text-emerald-800 text-[11px] mb-1">
                AGENT 05
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Scheduling Agent</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Replaces unfair FCFS queue with urgency-weighted slot booking. Reserves 24-48h fast-track slots for urgent needs.
              </p>
            </div>
            <div className="mt-2 text-[10px] font-mono text-emerald-700 font-semibold">
              Output: Confirmed Time Slot
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Rule Matrix */}
      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-teal-600" />
          <span>Enforced Clinical Rule Matrix (Sample Protocols)</span>
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-mono text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Rule ID</th>
                <th className="p-3">Condition &amp; Protocol</th>
                <th className="p-3">Tier / ESI</th>
                <th className="p-3">Action Enforced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CLINICAL_RULES.slice(0, 7).map((rule) => {
                const isEmergency = rule.tier === 'EMERGENCY';
                return (
                  <tr key={rule.ruleId} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{rule.ruleId}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{rule.name}</div>
                      <div className="text-[11px] text-slate-500">{rule.criteria}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          isEmergency
                            ? 'bg-rose-100 text-rose-800'
                            : rule.tier === 'URGENT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rule.tier} • ESI {rule.esiLevel}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-700">
                      {isEmergency ? (
                        <span className="text-rose-700 font-bold">
                          Circuit Breaker Halt &rarr; 911 / ED Ingress
                        </span>
                      ) : rule.tier === 'URGENT' ? (
                        <span className="text-amber-700 font-medium">
                          Expedited Fast-Track (&lt; 24-48h)
                        </span>
                      ) : (
                        <span className="text-emerald-700">
                          Standard Outpatient (3-7 days)
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

      {/* Safety Disclaimer */}
      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 leading-relaxed font-mono">
        <strong>Demo Notice:</strong> This prototype illustrates agentic AI symptom classification and priority queuing using Manchester Triage &amp; ESI clinical guidelines. For medical emergencies in real life, immediately contact 911 or local emergency services.
      </div>
    </div>
  );
};
