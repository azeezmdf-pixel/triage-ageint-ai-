import React, { useState } from 'react';
import {
  MessageSquare,
  ClipboardCheck,
  ShieldAlert,
  UserCheck,
  CalendarCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  Ban,
} from 'lucide-react';
import { AgentStepTrace, AgentId } from '../types';

interface AgentPipelineTrackerProps {
  traces: AgentStepTrace[];
  isProcessing: boolean;
  activeAgentIndex: number;
}

const AGENT_META: Record<
  AgentId,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  'patient-interaction': {
    icon: MessageSquare,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  'triage-protocol': {
    icon: ClipboardCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  'emergency-escalation': {
    icon: ShieldAlert,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  'specialist-matching': {
    icon: UserCheck,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  'scheduling': {
    icon: CalendarCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};

export const AgentPipelineTracker: React.FC<AgentPipelineTrackerProps> = ({
  traces,
  isProcessing,
  activeAgentIndex,
}) => {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedAgent(expandedAgent === id ? null : id);
  };

  const defaultAgents: {
    id: AgentId;
    num: number;
    title: string;
    role: string;
  }[] = [
    {
      id: 'patient-interaction',
      num: 1,
      title: 'Patient Interaction Agent',
      role: 'Symptom intake, duration & conversational normalization',
    },
    {
      id: 'triage-protocol',
      num: 2,
      title: 'Triage Protocol Agent',
      role: 'Manchester & ESI rule matrix analysis & urgency scoring',
    },
    {
      id: 'emergency-escalation',
      num: 3,
      title: 'Emergency Escalation Agent',
      role: 'Safety circuit-breaker watchdog; emergency guidance',
    },
    {
      id: 'specialist-matching',
      num: 4,
      title: 'Specialist Matching Agent',
      role: 'Anatomical mapping & physician subspecialty routing',
    },
    {
      id: 'scheduling',
      num: 5,
      title: 'Scheduling Agent',
      role: 'Urgency-weighted slot booking vs unfair FCFS queue',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Tracker Header */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight font-serif text-slate-100 flex items-center gap-2">
              Agentic AI Pipeline Trace
              {isProcessing && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-400/30 animate-pulse">
                  Running Agent {activeAgentIndex + 1}/5
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              5 autonomous agents collaborating via protocol guardrails
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Trace</span>
        </div>
      </div>

      {/* Agents Pipeline List */}
      <div className="divide-y divide-slate-100">
        {defaultAgents.map((agent, index) => {
          const trace = traces.find((t) => t.agentId === agent.id);
          const meta = AGENT_META[agent.id];
          const Icon = meta.icon;

          const isCurrentActive = isProcessing && activeAgentIndex === index;
          const isFinished = trace && trace.status !== 'idle';
          const isHalted = trace?.status === 'halted';
          const isBypassed = trace?.status === 'bypassed';
          const isExpanded = expandedAgent === agent.id;

          return (
            <div
              key={agent.id}
              className={`transition-colors ${
                isCurrentActive
                  ? 'bg-teal-50/60 ring-1 ring-inset ring-teal-300'
                  : isHalted
                  ? 'bg-rose-50/40'
                  : isBypassed
                  ? 'bg-slate-50/70 opacity-75'
                  : 'hover:bg-slate-50/60'
              }`}
            >
              <div
                onClick={() => isFinished && toggleExpand(agent.id)}
                className={`px-4 sm:px-5 py-3.5 flex items-start gap-3.5 ${
                  isFinished ? 'cursor-pointer' : ''
                }`}
              >
                {/* Agent Number / Icon indicator */}
                <div className="flex-shrink-0 mt-0.5 relative">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                      isCurrentActive
                        ? 'bg-teal-600 text-white border-teal-700 animate-pulse'
                        : isHalted
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : isBypassed
                        ? 'bg-slate-200 text-slate-500 border-slate-300'
                        : isFinished
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    {isCurrentActive ? (
                      <Clock className="w-4 h-4 animate-spin text-teal-200" />
                    ) : isHalted ? (
                      <Ban className="w-4 h-4 text-white" />
                    ) : isBypassed ? (
                      <AlertOctagon className="w-4 h-4 text-slate-500" />
                    ) : isFinished ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    ) : (
                      <span>0{agent.num}</span>
                    )}
                  </div>
                </div>

                {/* Agent Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        AGENT 0{agent.num}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {agent.title}
                      </h3>
                      {agent.id === 'emergency-escalation' && (
                        <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-rose-100 text-rose-800 border border-rose-200">
                          CIRCUIT BREAKER
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isCurrentActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-teal-100 text-teal-800 border border-teal-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
                          Evaluating
                        </span>
                      ) : isHalted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-600 text-white shadow-xs">
                          <Ban className="w-3 h-3" />
                          HALTED BY SAFETY WATCHDOG
                        </span>
                      ) : isBypassed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-200 text-slate-700">
                          Bypassed (ED Priority)
                        </span>
                      ) : isFinished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Decision Emitted
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">
                          Standby
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Role / Headline */}
                  <p className="text-xs text-slate-500 mt-0.5">
                    {trace?.headline || agent.role}
                  </p>

                  {/* Decision snippet if available */}
                  {trace && (
                    <div className="mt-2 p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed">
                      <div className="flex items-start gap-1.5">
                        <span className="font-semibold text-slate-900 flex-shrink-0">
                          Output:
                        </span>
                        <span className="text-slate-800">{trace.decision}</span>
                      </div>
                    </div>
                  )}

                  {/* Expandable reasoning trace */}
                  {trace && isExpanded && (
                    <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-2 text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-900 block font-mono text-[11px] uppercase tracking-wider text-slate-500">
                          Internal Agent Deliberation:
                        </span>
                        <p className="mt-1 text-slate-700 leading-normal">
                          {trace.reasoning}
                        </p>
                      </div>

                      {trace.metadata && Object.keys(trace.metadata).length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-mono">
                          {Object.entries(trace.metadata).map(([key, val]) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              <strong>{key}:</strong> {String(val)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Expand Chevron */}
                {isFinished && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(agent.id);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 mt-1"
                    title={isExpanded ? 'Collapse deliberation' : 'Expand deliberation'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
