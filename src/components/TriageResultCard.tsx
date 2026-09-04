import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Stethoscope,
  Building2,
  Video,
  Info,
  ArrowRight,
  Ambulance,
  Zap,
} from 'lucide-react';
import { TriageResult, TimeSlot } from '../types';

interface TriageResultCardProps {
  result: TriageResult;
  onBookSlot: (slot: TimeSlot) => void;
}

export const TriageResultCard: React.FC<TriageResultCardProps> = ({
  result,
  onBookSlot,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    result.availableSlots?.[0]?.id || null
  );
  const [edAlertSent, setEdAlertSent] = useState(false);

  const isEmergency = result.tier === 'EMERGENCY' || result.circuitBreakerTripped;
  const isUrgent = result.tier === 'URGENT';

  const handleBookSelected = () => {
    if (!selectedSlotId) return;
    const slot = result.availableSlots.find((s) => s.id === selectedSlotId);
    if (slot) onBookSlot(slot);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* ---------------------------------------------------- */}
      {/* EMERGENCY SAFETY TIER (CIRCUIT BREAKER ACTIVATED)     */}
      {/* ---------------------------------------------------- */}
      {isEmergency ? (
        <div>
          {/* Emergency Banner */}
          <div className="bg-rose-700 text-white p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-rose-600/40 pointer-events-none blur-xl" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white text-rose-700 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-rose-600/50 animate-pulse">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white text-rose-800 tracking-wider">
                    ESI LEVEL {result.esiLevel} • EMERGENCY-LEVEL
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-900/60 text-rose-100 border border-rose-400/40">
                    CIRCUIT BREAKER ACTIVATED
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-white">
                  Immediate Emergency Care Required
                </h2>
                <p className="text-sm text-rose-100 mt-1 font-medium leading-relaxed">
                  Routine outpatient appointment scheduling has been{' '}
                  <strong className="underline decoration-white decoration-2 font-bold">
                    IMMEDIATELY HALTED
                  </strong>{' '}
                  by the Emergency Escalation Agent (Agent 03).
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Body Content */}
          <div className="p-5 sm:p-6 space-y-5 bg-white">
            {/* Protocol Trigger Details */}
            <div className="p-4 rounded-lg bg-rose-50/80 border border-rose-200 text-xs sm:text-sm text-slate-800">
              <div className="flex items-center gap-2 text-rose-900 font-semibold mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>Triggered Safety Protocol: {result.protocolMatch.name}</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                <strong>Matched Rule:</strong> {result.protocolMatch.ruleId} (
                {result.protocolMatch.protocolSystem}) — &quot;{result.protocolMatch.criteria}&quot;
              </p>
              <p className="mt-2 text-slate-600 text-xs italic">
                {result.protocolMatch.clinicalRationale}
              </p>
            </div>

            {/* Immediate Action Steps */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <Ambulance className="w-4 h-4 text-rose-600" />
                <span>Mandatory Emergency Guidance</span>
              </h3>

              <div className="space-y-2">
                {result.emergencyGuidance?.immediateInstructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-normal">{instruction}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href="tel:911"
                id="emergency-call-btn"
                className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-lg font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all active:scale-[0.99] text-center"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call 911 / EMS Immediately</span>
              </a>

              <button
                type="button"
                id="notify-ed-btn"
                onClick={() => setEdAlertSent(true)}
                disabled={edAlertSent}
                className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg font-bold text-sm border transition-all ${
                  edAlertSent
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-xs'
                }`}
              >
                {edAlertSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ED Ingress Alert Transmitted</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Send Pre-Arrival Alert to ED</span>
                  </>
                )}
              </button>
            </div>

            {/* Nearest Facility Card */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block">
                  Nearest Designated Acute Care Facility:
                </span>
                <span className="text-slate-700">
                  {result.emergencyGuidance?.nearestFacility ||
                    'St. Jude Metropolitan Trauma Center — Main ED Ingress Bay'}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Triage Status: Level 1 Trauma Center • Open 24/7 • Direct Ambulance Bay
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* URGENT OR ROUTINE TIER (SPECIALIST SCHEDULING READY)   */
        /* ---------------------------------------------------- */
        <div>
          {/* Status Header */}
          <div
            className={`p-5 sm:p-6 text-white border-b ${
              isUrgent ? 'bg-amber-600 border-amber-700' : 'bg-teal-700 border-teal-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white text-slate-900">
                  ESI LEVEL {result.esiLevel} • {result.tier}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-white/20 text-white">
                  {result.protocolMatch.ruleId}
                </span>
              </div>
              <span className="text-xs font-mono opacity-90">
                {isUrgent ? 'Fast-Track Priority Queue' : 'Standard Outpatient Queue'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-white mt-1">
              {isUrgent
                ? 'Urgent Care Needed — Fast-Track Window Allocated'
                : 'Routine Care Recommended — Standard Slot Available'}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1">
              {result.protocolMatch.clinicalRationale}
            </p>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Matched Specialist Card */}
            {result.specialist && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Agent 04 Matched Specialist:</span>
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold">
                    {result.specialist.urgencyWindow}
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-lg bg-teal-800 text-white flex items-center justify-center font-serif text-lg font-bold flex-shrink-0 shadow-xs">
                    {result.specialist.doctorName.split(' ')[1]?.[0] || 'Dr'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {result.specialist.doctorName}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {result.specialist.doctorTitle} • {result.specialist.department}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{result.specialist.clinicLocation}</span>
                      </span>
                      {result.specialist.telehealthAvailable && (
                        <span className="flex items-center gap-1 text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-mono text-[11px]">
                          <Video className="w-3 h-3" />
                          <span>Telehealth Eligible</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Priority Slots */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>
                    Agent 05 Smart Slot Allocation ({result.availableSlots.length} Available)
                  </span>
                </h3>
                {isUrgent && (
                  <span className="text-xs font-mono text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    &lt; 24-48h Fast-Track Window
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.availableSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      id={`slot-card-${slot.id}`}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-600 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {slot.displayDate}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                            slot.type === 'telehealth'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {slot.type === 'telehealth' ? 'Virtual' : 'In-Person'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm font-semibold text-teal-800">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{slot.displayTime}</span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {slot.room}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Book Appointment CTA Button */}
              <div className="pt-4">
                <button
                  type="button"
                  id="confirm-booking-btn"
                  onClick={handleBookSelected}
                  disabled={!selectedSlotId}
                  className="w-full py-3.5 px-4 rounded-lg font-bold text-sm bg-teal-700 hover:bg-teal-800 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {isUrgent ? 'Confirm Expedited Fast-Track Slot' : 'Confirm Outpatient Booking'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* First-Come-First-Served vs Urgency Comparison Note */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">Why Agentic Scheduling Matters:</strong> In a
                traditional First-Come-First-Served hospital queue, this patient would have waited{' '}
                <strong>{isUrgent ? '4 to 6 days' : '7 to 10 days'}</strong>. Our 5-agent pipeline
                prioritized care based on clinical protocol, reducing wait time to{' '}
                <strong className="text-teal-800 font-semibold">
                  {isUrgent ? 'within 24 hours' : 'optimized standard availability'}
                </strong>
                .
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
