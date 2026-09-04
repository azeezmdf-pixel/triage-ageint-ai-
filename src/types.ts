export type TriageTier = 'EMERGENCY' | 'URGENT' | 'ROUTINE';

export type EsiLevel = 1 | 2 | 3 | 4 | 5;

export type AgentId = 
  | 'patient-interaction' 
  | 'triage-protocol' 
  | 'emergency-escalation' 
  | 'specialist-matching' 
  | 'scheduling';

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'halted' | 'bypassed';

export interface AgentStepTrace {
  agentId: AgentId;
  agentNumber: number;
  name: string;
  role: string;
  status: AgentStatus;
  headline: string;
  reasoning: string;
  decision: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: string;
}

export interface PatientInputData {
  rawInput: string;
  patientName?: string;
  age?: number;
  symptoms: string[];
  onset: string;
  severityScore: number; // 1 - 10
  associatedFlags: string[];
}

export interface ProtocolRuleMatch {
  ruleId: string;
  name: string;
  protocolSystem: 'Manchester Triage' | 'Emergency Severity Index (ESI)';
  criteria: string;
  esiLevel: EsiLevel;
  tier: TriageTier;
  clinicalRationale: string;
}

export interface SpecialistMatch {
  department: string;
  subspecialty: string;
  doctorName: string;
  doctorTitle: string;
  clinicLocation: string;
  telehealthAvailable: boolean;
  urgencyWindow: string; // e.g., "Expedited Fast-Track (<24-48 hours)" or "Standard (<5-7 days)"
}

export interface TimeSlot {
  id: string;
  datetime: string;
  displayDate: string;
  displayTime: string;
  doctorName: string;
  department: string;
  type: 'in-person' | 'telehealth';
  room: string;
  isUrgencyFastTrack: boolean;
}

export interface EmergencyGuidance {
  codeLevel: 'CODE_RED_RESUSCITATION' | 'CODE_ORANGE_EMERGENT' | 'HIGH_RISK_WATCH';
  emergencyCall: string;
  nearestFacility: string;
  immediateInstructions: string[];
  clinicalWarning: string;
  firstAidSteps: string[];
}

export interface TriageResult {
  id: string;
  timestamp: string;
  patientInput: PatientInputData;
  tier: TriageTier;
  esiLevel: EsiLevel;
  protocolMatch: ProtocolRuleMatch;
  isEmergency: boolean;
  circuitBreakerTripped: boolean;
  haltReason?: string;
  specialist: SpecialistMatch | null;
  availableSlots: TimeSlot[];
  emergencyGuidance?: EmergencyGuidance;
  agentTrace: AgentStepTrace[];
  disclaimer: string;
}

export interface QueuePatient {
  id: string;
  patientName: string;
  symptoms: string;
  onset: string;
  severity: number;
  tier: TriageTier;
  esiLevel: EsiLevel;
  matchedDepartment: string;
  matchedDoctor?: string;
  scheduledTime?: string;
  status: 'Dispatched to ED' | 'Scheduled Fast-Track' | 'Scheduled Standard' | 'Evaluating';
  createdAt: string;
  traditionalWaitDays: number; // FCFS wait
  agenticWaitHours: number;   // Prioritized wait
}

export interface HospitalStats {
  activeQueueCount: number;
  emergencyEscalations: number;
  urgentFastTrack: number;
  routineScheduled: number;
  preventedDelayHours: number;
}
