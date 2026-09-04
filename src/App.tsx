import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IntakeConsole } from './components/IntakeConsole';
import { AgentPipelineTracker } from './components/AgentPipelineTracker';
import { TriageResultCard } from './components/TriageResultCard';
import { HospitalDashboard } from './components/HospitalDashboard';
import { ProtocolReferenceModal } from './components/ProtocolReferenceModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import {
  TriageResult,
  AgentStepTrace,
  QueuePatient,
  HospitalStats,
  TimeSlot,
} from './types';
import { INITIAL_HOSPITAL_QUEUE } from './data/clinicalProtocols';
import {
  AlertTriangle,
  Stethoscope,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'intake' | 'dashboard' | 'protocol'>('intake');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [agentTraces, setAgentTraces] = useState<AgentStepTrace[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hospitalQueue, setHospitalQueue] = useState<QueuePatient[]>(INITIAL_HOSPITAL_QUEUE);
  const [stats, setStats] = useState<HospitalStats>({
    activeQueueCount: INITIAL_HOSPITAL_QUEUE.length,
    emergencyEscalations: INITIAL_HOSPITAL_QUEUE.filter((p) => p.tier === 'EMERGENCY').length,
    urgentFastTrack: INITIAL_HOSPITAL_QUEUE.filter((p) => p.tier === 'URGENT').length,
    routineScheduled: INITIAL_HOSPITAL_QUEUE.filter((p) => p.tier === 'ROUTINE').length,
    preventedDelayHours: 240,
  });

  const [bookingConfirmation, setBookingConfirmation] = useState<{
    bookingId: string;
    patientName: string;
    patientPhone: string;
    slot: TimeSlot;
    department: string;
    doctorName: string;
    location: string;
    urgencyTier: any;
  } | null>(null);

  // Fetch current hospital queue on mount
  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/hospital/queue');
      if (res.ok) {
        const data = await res.json();
        setHospitalQueue(data.patients);
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Queue fetch fallback:', err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Run triage pipeline with visual sequential agent animation
  const handleRunTriage = async (params: {
    input: string;
    patientName: string;
    age: number;
    reportedOnset: string;
    reportedSeverity: number;
  }) => {
    setIsProcessing(true);
    setActiveAgentIndex(0);
    setTriageResult(null);
    setAgentTraces([]);
    setErrorMessage(null);

    try {
      // Step 1: Agent 1 - Intake
      setActiveAgentIndex(0);
      await new Promise((r) => setTimeout(r, 450));

      // Step 2: Agent 2 - Protocol
      setActiveAgentIndex(1);
      await new Promise((r) => setTimeout(r, 450));

      // Call server to process
      const response = await fetch('/api/triage/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze patient symptoms');
      }

      const data: TriageResult = await response.json();

      // Step 3: Agent 3 - Escalation Circuit Breaker
      setActiveAgentIndex(2);
      await new Promise((r) => setTimeout(r, 450));

      if (data.isEmergency) {
        // Stop pipeline here! Agent 3 halted routine scheduling
        setAgentTraces(data.agentTrace);
        setTriageResult(data);
        setIsProcessing(false);
        fetchQueue();
        return;
      }

      // Step 4: Agent 4 - Specialist Match
      setActiveAgentIndex(3);
      await new Promise((r) => setTimeout(r, 400));

      // Step 5: Agent 5 - Scheduling
      setActiveAgentIndex(4);
      await new Promise((r) => setTimeout(r, 400));

      setAgentTraces(data.agentTrace);
      setTriageResult(data);
      fetchQueue();
    } catch (err: any) {
      console.error('Triage process error:', err);
      setErrorMessage(err?.message || 'Unable to complete triage analysis. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle appointment slot booking
  const handleBookSlot = async (slot: TimeSlot) => {
    if (!triageResult) return;

    try {
      const response = await fetch('/api/triage/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          patientName: triageResult.patientInput.patientName,
          patientPhone: '(555) 392-8172',
          patientEmail: 'patient@healthmail.org',
          triageResult,
        }),
      });

      if (response.ok) {
        const bookingData = await response.json();
        setBookingConfirmation({
          bookingId: bookingData.bookingId,
          patientName: bookingData.patientName,
          patientPhone: bookingData.patientPhone,
          slot,
          department: bookingData.department,
          doctorName: bookingData.doctorName,
          location: bookingData.location,
          urgencyTier: bookingData.urgencyTier,
        });
        fetchQueue();
      }
    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  const handleResetQueue = async () => {
    try {
      const res = await fetch('/api/hospital/reset', { method: 'POST' });
      if (res.ok) {
        fetchQueue();
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // Run benchmark test on initial load so the screen is immediately populated
  useEffect(() => {
    handleRunTriage({
      input: "I've had heavy chest tightness for the last hour and I feel short of breath even sitting still.",
      patientName: 'David Miller',
      age: 54,
      reportedOnset: '1 hour ago',
      reportedSeverity: 9,
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-700 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        queueCount={hospitalQueue.length}
        emergencyCount={stats.emergencyEscalations}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Patient Intake & Multi-Agent Trace */}
        {activeTab === 'intake' && (
          <div className="space-y-6">
            {/* Context Sub-header */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
                  Autonomous Triage &amp; Scheduling Engine
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-mono">
                  5-Agent Collaborative Pipeline with Clinical Circuit Breaker
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>View Hospital Queue</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 text-amber-900 text-sm">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-xs uppercase tracking-wider text-amber-800">Operational Notice</p>
                    <p className="text-amber-800 text-xs mt-0.5">{errorMessage}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-amber-600 hover:text-amber-800 text-xs font-semibold px-2 py-1 rounded cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Two-Column Layout: Left (Intake & Result), Right (5-Agent Trace) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Intake Console & Result Output */}
              <div className="lg:col-span-7 space-y-6">
                <IntakeConsole
                  onSubmit={handleRunTriage}
                  isProcessing={isProcessing}
                  onReset={() => {
                    setTriageResult(null);
                    setAgentTraces([]);
                  }}
                  lastPatientInput={triageResult?.patientInput}
                />

                {/* Triage Decision Card */}
                {triageResult && (
                  <TriageResultCard
                    result={triageResult}
                    onBookSlot={handleBookSlot}
                  />
                )}
              </div>

              {/* Right Column: Multi-Agent Pipeline Trace */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                <AgentPipelineTracker
                  traces={agentTraces}
                  isProcessing={isProcessing}
                  activeAgentIndex={activeAgentIndex}
                />

                {/* Quick Info Box */}
                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900 font-mono text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>Agentic Safety Principles</span>
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    <strong>Rule-Grounded Urgency:</strong> When symptoms match red-flag criteria (e.g. chest pressure + dyspnea onset &lt; 24h), the Emergency Escalation Agent enforces a hard circuit break to prevent dangerous home waiting.
                  </p>
                  <p className="leading-relaxed text-slate-600">
                    <strong>Priority Scheduling:</strong> Non-emergency urgent cases bypass the traditional first-come first-served queue to receive expedited fast-track booking within 24–48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Hospital Care Team Command Center */}
        {activeTab === 'dashboard' && (
          <HospitalDashboard
            queue={hospitalQueue}
            stats={stats}
            onResetQueue={handleResetQueue}
          />
        )}

        {/* Tab 3: Protocol & Agent Architecture Reference */}
        {activeTab === 'protocol' && (
          <ProtocolReferenceModal onClose={() => setActiveTab('intake')} />
        )}
      </main>

      {/* Booking Confirmation Pass Modal */}
      {bookingConfirmation && (
        <BookingConfirmationModal
          bookingData={bookingConfirmation}
          onClose={() => setBookingConfirmation(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500 font-mono mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            TriageAI • Clinical Triage & Scheduling Agent
          </span>
          <span>
            Manchester Triage System &amp; Emergency Severity Index (ESI) Framework
          </span>
        </div>
      </footer>
    </div>
  );
}
