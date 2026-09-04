import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  CLINICAL_RULES,
  SPECIALIST_DIRECTORY,
  generateAvailableSlots,
  INITIAL_HOSPITAL_QUEUE,
} from './src/data/clinicalProtocols.js';
import {
  TriageResult,
  AgentStepTrace,
  QueuePatient,
  TriageTier,
  EsiLevel,
} from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory queue state for hospital triaging dashboard
let hospitalQueue: QueuePatient[] = [...INITIAL_HOSPITAL_QUEUE];

// Initialize Gemini client if key is provided
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[Gemini API] Server-side Gemini client initialized.');
  } catch (err) {
    console.warn('[Gemini API] Warning initializing GoogleGenAI:', err);
  }
} else {
  console.log('[Gemini API] No GEMINI_API_KEY detected in env. Using deterministic clinical rule engine.');
}

interface GeminiTriageSynthesis {
  extractedSymptoms: string[];
  primaryConcern: string;
  recommendedTier: TriageTier;
  esiLevel: EsiLevel;
  redFlagsDetected: string[];
  clinicalRationale: string;
  recommendedSpecialty: string;
  patientFriendlyMessage: string;
}

// Resilient multi-model pool for high-demand spikes
const GEMINI_TEXT_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

async function requestGeminiTriage(prompt: string): Promise<GeminiTriageSynthesis | null> {
  if (!geminiClient) return null;

  for (const model of GEMINI_TEXT_MODELS) {
    try {
      const timeoutMs = 4500;
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeoutMs)
      );

      const apiPromise = geminiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const response: any = await Promise.race([apiPromise, timeoutPromise]);

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return parsed as GeminiTriageSynthesis;
      }
    } catch (err: any) {
      const errStr = String(err?.message || err);
      const isTransient =
        err?.status === 'UNAVAILABLE' ||
        err?.code === 503 ||
        errStr.includes('503') ||
        errStr.includes('429') ||
        errStr.includes('high demand') ||
        errStr.includes('UNAVAILABLE') ||
        errStr.includes('REQUEST_TIMEOUT');

      if (isTransient) {
        console.info(`[Gemini API] Notice: ${model} is experiencing temporary latency/demand. Trying next model...`);
        continue;
      }
      console.warn(`[Gemini API] Notice on ${model}: ${errStr.slice(0, 150)}`);
    }
  }
  return null;
}

function generateRuleBasedSynthesis(
  rawInput: string,
  matchedRule: (typeof CLINICAL_RULES)[0],
  tier: TriageTier,
  esiLevel: EsiLevel,
  reportedOnset: string,
  reportedSeverity: number
): GeminiTriageSynthesis {
  const lower = rawInput.toLowerCase();
  const symptomsTokens = rawInput
    .split(/[,.;!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  const isEmergency = tier === 'EMERGENCY';
  const isUrgent = tier === 'URGENT';
  const dept = matchSpecialistDepartment(rawInput);

  let patientMsg = `Thank you for sharing your symptoms. Our clinical triage system has evaluated your presentation (${matchedRule.ruleId}). `;
  if (isEmergency) {
    patientMsg += `Given the critical nature of your symptoms (${matchedRule.name}), immediate emergency medical care is required. Please do not wait for an outpatient appointment.`;
  } else if (isUrgent) {
    patientMsg += `Your condition requires timely medical review within 24 to 48 hours. An expedited priority slot has been allocated with ${dept}.`;
  } else {
    patientMsg += `Your symptoms appear stable for outpatient consultation. A standard booking window has been assigned with ${dept}.`;
  }

  const redFlags: string[] = [];
  if (isEmergency) {
    if (/chest|heart|cardiac|angina/i.test(lower)) redFlags.push('Acute coronary syndrome / myocardial ischemia risk');
    if (/breath|dyspnea|gasp|airway|wheez/i.test(lower)) redFlags.push('Impaired respiratory function / ventilation compromise');
    if (/face|droop|slur|stroke|numb|arm/i.test(lower)) redFlags.push('Acute focal neurological deficit / FAST stroke criteria');
    if (/bleed|hemorrhage|lacerat/i.test(lower)) redFlags.push('Active vascular injury / acute blood loss');
    if (redFlags.length === 0) redFlags.push('Critical physiological threat detected');
  } else if (isUrgent) {
    if (reportedSeverity >= 7) redFlags.push(`High reported severity score (${reportedSeverity}/10)`);
    if (/fracture|deform|burn|wound/i.test(lower)) redFlags.push('Structural trauma requiring rapid stabilization');
  }

  return {
    extractedSymptoms: symptomsTokens.length > 0 ? symptomsTokens : [matchedRule.name],
    primaryConcern: matchedRule.name,
    recommendedTier: tier,
    esiLevel,
    redFlagsDetected: redFlags,
    clinicalRationale: matchedRule.clinicalRationale,
    recommendedSpecialty: dept,
    patientFriendlyMessage: patientMsg,
  };
}

// Helper: Rule-based triage matcher
function evaluateClinicalRules(text: string, severityHint?: number): {
  matchedRule: (typeof CLINICAL_RULES)[0] | null;
  tier: TriageTier;
  esiLevel: EsiLevel;
} {
  const lower = text.toLowerCase();

  // 1. Check Emergency Rules First (Safety Priority)
  for (const rule of CLINICAL_RULES) {
    if (rule.tier === 'EMERGENCY') {
      const allTriggered = rule.triggers.every((regex) => regex.test(lower));
      if (allTriggered) {
        return {
          matchedRule: rule,
          tier: 'EMERGENCY',
          esiLevel: rule.esiLevel,
        };
      }
    }
  }

  // 2. Check Urgent Rules
  for (const rule of CLINICAL_RULES) {
    if (rule.tier === 'URGENT') {
      const allTriggered = rule.triggers.every((regex) => regex.test(lower));
      if (allTriggered) {
        return {
          matchedRule: rule,
          tier: 'URGENT',
          esiLevel: rule.esiLevel,
        };
      }
    }
  }

  // 3. Check Routine Rules
  for (const rule of CLINICAL_RULES) {
    if (rule.tier === 'ROUTINE') {
      const allTriggered = rule.triggers.every((regex) => regex.test(lower));
      if (allTriggered) {
        return {
          matchedRule: rule,
          tier: 'ROUTINE',
          esiLevel: rule.esiLevel,
        };
      }
    }
  }

  // Fallback heuristic based on reported pain severity or keywords
  if (severityHint && severityHint >= 8) {
    return {
      matchedRule: CLINICAL_RULES[0], // cardiac/respiratory warning
      tier: 'URGENT',
      esiLevel: 3,
    };
  }

  return {
    matchedRule: CLINICAL_RULES.find((r) => r.ruleId === 'RESP-URI-ROUTINE') || null,
    tier: 'ROUTINE',
    esiLevel: 5,
  };
}

// Helper: Department Matcher
function matchSpecialistDepartment(text: string): string {
  const lower = text.toLowerCase();
  if (/(chest|heart|palpitat|cardiac|cardio|blood pressure|hypertension|angina)/i.test(lower)) {
    return 'Cardiology';
  }
  if (/(breath|lung|asthma|wheez|cough|respirat|inhaler)/i.test(lower)) {
    return 'Pulmonology';
  }
  if (/(head|migraine|neuro|dizz|slur|face|droop|numb|tingl|seizure|stroke)/i.test(lower)) {
    return 'Neurology';
  }
  if (/(stomach|abdomen|abdomin|nausea|vomit|diarrhea|digest|acid|belly|bowel)/i.test(lower)) {
    return 'Gastroenterology';
  }
  if (/(cut|lacerat|wound|bleed|stitch|burn|glass|knife|stab)/i.test(lower)) {
    return 'Surgery';
  }
  if (/(back|joint|muscle|bone|sprain|fracture|knee|shoulder|neck|ligament|gardening)/i.test(lower)) {
    return 'Orthopedics';
  }
  if (/(ear|nose|throat|sinus|hearing|pharyngitis|tonsil)/i.test(lower)) {
    return 'ENT';
  }
  if (/(skin|rash|acne|itch|eczema|dermat|mole|hive)/i.test(lower)) {
    return 'Dermatology';
  }
  return 'General Practice';
}

// ----------------------------------------------------
// 5-AGENT TRIAGE PIPELINE ENGINE
// ----------------------------------------------------
async function runFiveAgentPipeline(params: {
  rawInput: string;
  patientName?: string;
  age?: number;
  reportedOnset?: string;
  reportedSeverity?: number;
}): Promise<TriageResult> {
  const { rawInput, patientName = 'Patient', age = 45, reportedOnset = '1 hour ago', reportedSeverity = 5 } = params;
  const now = new Date();
  const timestampStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // 1. Initial rule evaluation for absolute safety baseline
  const ruleResult = evaluateClinicalRules(rawInput, reportedSeverity);
  const matchedRule = ruleResult.matchedRule || CLINICAL_RULES[0];
  let tier = ruleResult.tier;
  let esiLevel = ruleResult.esiLevel;
  const isEmergencyTier = tier === 'EMERGENCY';

  // Extract key symptom keywords
  const symptomsTokens = rawInput
    .split(/[,.;!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  // Gemini Reasoning Enhancement with Multi-Model Fallback & Deterministic Safety Net
  const geminiPrompt = `You are an expert Clinical Triage AI supervising a hospital 5-agent pipeline.
Patient statement: "${rawInput}"
Reported Onset: "${reportedOnset}", Reported Severity Score: ${reportedSeverity}/10.

Analyze this patient presentation. Output strict JSON with these keys:
{
  "extractedSymptoms": ["symptom1", "symptom2"],
  "primaryConcern": "short clinical phrase",
  "recommendedTier": "EMERGENCY" | "URGENT" | "ROUTINE",
  "esiLevel": 1 | 2 | 3 | 4 | 5,
  "redFlagsDetected": ["flag1"],
  "clinicalRationale": "concise medical explanation (2-3 sentences)",
  "recommendedSpecialty": "Cardiology" | "Pulmonology" | "Neurology" | "Gastroenterology" | "Surgery" | "Orthopedics" | "ENT" | "Dermatology" | "General Practice",
  "patientFriendlyMessage": "empathetic 1-2 sentence response to patient"
}
SAFETY MANDATE: If there is any mention of chest pain, shortness of breath, stroke symptoms (facial droop, slurred speech), severe bleeding, throat swelling, or unconsciousness, ALWAYS designate EMERGENCY and ESI level 1 or 2.`;

  let geminiSynthesis: GeminiTriageSynthesis | null = await requestGeminiTriage(geminiPrompt);

  if (geminiSynthesis) {
    // Safety constraint: Never downgrade an emergency if rule engine detected an emergency
    if (ruleResult.tier === 'EMERGENCY') {
      geminiSynthesis.recommendedTier = 'EMERGENCY';
      geminiSynthesis.esiLevel = Math.min(ruleResult.esiLevel, geminiSynthesis.esiLevel || 2) as EsiLevel;
    } else if (geminiSynthesis.recommendedTier === 'EMERGENCY') {
      // If Gemini caught a critical emergency the rule engine missed, upgrade for safety!
      tier = 'EMERGENCY';
      esiLevel = (geminiSynthesis.esiLevel || 2) as EsiLevel;
    }
  } else {
    // Deterministic fallback synthesis grounded in clinical rules
    geminiSynthesis = generateRuleBasedSynthesis(rawInput, matchedRule, tier, esiLevel, reportedOnset, reportedSeverity);
  }

  // If Gemini upgraded or verified
  const finalTier: TriageTier = isEmergencyTier ? 'EMERGENCY' : (geminiSynthesis?.recommendedTier || tier);
  const finalEsi: EsiLevel = isEmergencyTier ? esiLevel : (geminiSynthesis?.esiLevel || esiLevel);
  const isEmergency = finalTier === 'EMERGENCY';

  // ----------------------------------------------------
  // AGENT 1: Patient Interaction Agent
  // ----------------------------------------------------
  const agent1Trace: AgentStepTrace = {
    agentId: 'patient-interaction',
    agentNumber: 1,
    name: 'Patient Interaction Agent',
    role: 'Intake, Natural Language Parsing & Entity Extraction',
    status: 'completed',
    headline: `Extracted ${geminiSynthesis?.extractedSymptoms?.length || symptomsTokens.length} symptom entities with onset timeline.`,
    reasoning: `Processed self-reported patient narrative. Normalized colloquial descriptors into clinical symptom ontology. Identified onset duration (${reportedOnset}) and self-assessed pain severity (${reportedSeverity}/10). Maintained clear, low-friction patient communication.`,
    decision: geminiSynthesis?.patientFriendlyMessage || `Thank you for sharing. We have noted your reported symptoms ("${symptomsTokens.slice(0, 2).join(', ')}") and are immediately analyzing clinical urgency against hospital protocols.`,
    metadata: {
      patientName,
      patientAge: age,
      reportedOnset,
      reportedSeverity,
      symptomsCount: symptomsTokens.length,
    },
    timestamp: timestampStr,
  };

  // ----------------------------------------------------
  // AGENT 2: Triage Protocol Agent
  // ----------------------------------------------------
  const protocolName = matchedRule.protocolSystem;
  const agent2Trace: AgentStepTrace = {
    agentId: 'triage-protocol',
    agentNumber: 2,
    name: 'Triage Protocol Agent',
    role: 'Clinical Urgency & Protocol Classification (Manchester / ESI)',
    status: 'completed',
    headline: `Assigned ${finalTier} Tier (ESI Level ${finalEsi}) via ${matchedRule.ruleId}.`,
    reasoning: geminiSynthesis?.clinicalRationale || matchedRule.clinicalRationale,
    decision: `Criteria matched: "${matchedRule.criteria}". Protocol: ${protocolName} -> Classified as ${finalTier} (ESI Level ${finalEsi}). Clinical Rationale: ${matchedRule.clinicalRationale}`,
    metadata: {
      ruleId: matchedRule.ruleId,
      protocolSystem: protocolName,
      tier: finalTier,
      esiLevel: finalEsi,
    },
    timestamp: timestampStr,
  };

  // ----------------------------------------------------
  // AGENT 3: Emergency Escalation Agent (CIRCUIT BREAKER)
  // ----------------------------------------------------
  const circuitBreakerTripped = isEmergency;
  const agent3Trace: AgentStepTrace = {
    agentId: 'emergency-escalation',
    agentNumber: 3,
    name: 'Emergency Escalation Agent',
    role: 'Safety Watchdog & Circuit-Breaker Guardrail',
    status: circuitBreakerTripped ? 'completed' : 'completed',
    headline: circuitBreakerTripped
      ? 'CIRCUIT BREAKER TRIPPED: Emergency escalation active. Routine scheduling HALTED.'
      : 'SAFETY CLEARANCE: No emergency red-flags detected. Cleared for specialist routing.',
    reasoning: circuitBreakerTripped
      ? `Critical safety threshold violated by rule ${matchedRule.ruleId} (${matchedRule.name}). Protocol mandate forbids outpatient appointment delay for acute, life-threatening, or limb-threatening complaints. Emergency stop activated.`
      : `Patient presentation does not exhibit immediate hemodynamic compromise, acute stroke indicators, airway failure, or uncontrolled bleeding. Routine outpatient workflow permitted.`,
    decision: circuitBreakerTripped
      ? 'HALT APPOINTMENT SCHEDULING. Trigger Emergency Code Red / Orange alert. Display immediate 911 dispatch and emergency department directions.'
      : 'SAFETY VERIFIED. Handing off patient data to Specialist Matching Agent.',
    metadata: {
      circuitBreakerTripped,
      escalationLevel: circuitBreakerTripped ? (finalEsi === 1 ? 'CODE_RED_RESUSCITATION' : 'CODE_ORANGE_EMERGENT') : 'STANDARD_CLEARANCE',
      safetyHaltActive: circuitBreakerTripped,
    },
    timestamp: timestampStr,
  };

  // ----------------------------------------------------
  // AGENT 4: Specialist Matching Agent
  // ----------------------------------------------------
  const matchedDept = geminiSynthesis?.recommendedSpecialty || matchSpecialistDepartment(rawInput);
  const specialistDoctor = SPECIALIST_DIRECTORY[matchedDept] || SPECIALIST_DIRECTORY['General Practice'];

  const agent4Trace: AgentStepTrace = {
    agentId: 'specialist-matching',
    agentNumber: 4,
    name: 'Specialist Matching Agent',
    role: 'Departmental Routing & Physician Recommendation',
    status: circuitBreakerTripped ? 'bypassed' : 'completed',
    headline: circuitBreakerTripped
      ? 'Bypassed — Emergency patient routed directly to Emergency Department (ED)'
      : `Matched to ${specialistDoctor.department} (${specialistDoctor.name})`,
    reasoning: circuitBreakerTripped
      ? 'Outpatient subspecialty scheduling is bypassed in favor of immediate Emergency Department triage and acute resuscitation team.'
      : `Analyzed anatomical focus and symptom typology. Highest clinical concordance found with ${specialistDoctor.department} (${specialistDoctor.subspecialty}).`,
    decision: circuitBreakerTripped
      ? 'Emergency Department (ED) / Trauma Bay routing active.'
      : `Designated Primary Specialist: ${specialistDoctor.name}, Department: ${specialistDoctor.department} (${specialistDoctor.clinicLocation}).`,
    metadata: {
      department: specialistDoctor.department,
      subspecialty: specialistDoctor.subspecialty,
      doctor: specialistDoctor.name,
      telehealthEligible: specialistDoctor.telehealthAvailable,
    },
    timestamp: timestampStr,
  };

  // ----------------------------------------------------
  // AGENT 5: Scheduling Agent
  // ----------------------------------------------------
  const availableSlots = circuitBreakerTripped ? [] : generateAvailableSlots(matchedDept, finalTier === 'URGENT' ? 'URGENT' : 'ROUTINE');

  const agent5Trace: AgentStepTrace = {
    agentId: 'scheduling',
    agentNumber: 5,
    name: 'Scheduling Agent',
    role: 'Priority Queue Optimization & Slot Allocation',
    status: circuitBreakerTripped ? 'halted' : 'completed',
    headline: circuitBreakerTripped
      ? 'SCHEDULING HALTED by Emergency Escalation Agent'
      : `Generated ${availableSlots.length} priority slots in ${finalTier === 'URGENT' ? 'Expedited 24-48h Window' : 'Standard 3-7d Window'}`,
    reasoning: circuitBreakerTripped
      ? 'Scheduling flow strictly prohibited. Routine booking slots are blocked to prevent patient from waiting at home during an active medical emergency.'
      : `Prioritized over traditional First-Come-First-Served queue. Patient categorized as ${finalTier}, allocated ${finalTier === 'URGENT' ? 'fast-track reserved emergency buffer slots' : 'standard outpatient consultation slots'}.`,
    decision: circuitBreakerTripped
      ? '0 slots offered. Transferred to Immediate Emergency Guidance protocol.'
      : `Allocated ${availableSlots.length} urgency-calibrated time slots for ${specialistDoctor.name}. Priority booking ready.`,
    metadata: {
      slotsGenerated: availableSlots.length,
      urgencyWindow: finalTier === 'URGENT' ? '<24-48 hours' : '3-7 days',
      traditionalWaitDays: finalTier === 'URGENT' ? 5 : 4,
      optimizedWaitHours: finalTier === 'URGENT' ? 24 : 96,
    },
    timestamp: timestampStr,
  };

  // Emergency Guidance construction if applicable
  const emergencyGuidance = circuitBreakerTripped
    ? {
        codeLevel: finalEsi === 1 ? ('CODE_RED_RESUSCITATION' as const) : ('CODE_ORANGE_EMERGENT' as const),
        emergencyCall: '911 / 112 (Immediate EMS Dispatch)',
        nearestFacility: 'St. Jude Metropolitan Trauma Center — Main ED Ingress Bay',
        immediateInstructions: [
          'DO NOT wait for a scheduled appointment. This symptom pattern indicates an acute medical emergency.',
          'Call 911 or your local emergency response service immediately.',
          'Do not attempt to drive yourself to the hospital; await paramedic transport or have a designated driver.',
          'If experiencing chest pain: sit upright, remain calm, loosen tight clothing around neck and chest.',
          'If stroke symptoms (face droop, arm weakness, slurred speech): note exact time of onset for the medical team.',
        ],
        clinicalWarning: `Immediate life-safety escalation triggered under ${matchedRule.ruleId} (${matchedRule.name}). Protocol mandate halts routine appointment scheduling.`,
        firstAidSteps: [
          'Keep patient seated or in recovery position if conscious.',
          'Keep airway open and monitor breathing continuously.',
          'Have current medication list and allergies ready for EMS arrival.',
        ],
      }
    : undefined;

  return {
    id: `trg-${Date.now()}`,
    timestamp: new Date().toISOString(),
    patientInput: {
      rawInput,
      patientName,
      age,
      symptoms: geminiSynthesis?.extractedSymptoms || symptomsTokens,
      onset: reportedOnset,
      severityScore: reportedSeverity,
      associatedFlags: geminiSynthesis?.redFlagsDetected || [],
    },
    tier: finalTier,
    esiLevel: finalEsi,
    protocolMatch: {
      ruleId: matchedRule.ruleId,
      name: matchedRule.name,
      protocolSystem: matchedRule.protocolSystem,
      criteria: matchedRule.criteria,
      esiLevel: finalEsi,
      tier: finalTier,
      clinicalRationale: geminiSynthesis?.clinicalRationale || matchedRule.clinicalRationale,
    },
    isEmergency,
    circuitBreakerTripped,
    haltReason: circuitBreakerTripped ? `Halted by Emergency Escalation Agent: ${matchedRule.name}` : undefined,
    specialist: circuitBreakerTripped
      ? null
      : {
          department: specialistDoctor.department,
          subspecialty: specialistDoctor.subspecialty,
          doctorName: specialistDoctor.name,
          doctorTitle: specialistDoctor.title,
          clinicLocation: specialistDoctor.clinicLocation,
          telehealthAvailable: specialistDoctor.telehealthAvailable,
          urgencyWindow: finalTier === 'URGENT' ? 'Expedited Fast-Track (<24-48 hours)' : 'Standard Routine (<5-7 days)',
        },
    availableSlots,
    emergencyGuidance,
    agentTrace: [agent1Trace, agent2Trace, agent3Trace, agent4Trace, agent5Trace],
    disclaimer:
      'Triage AI prototype based on Manchester & ESI clinical triage rule sets. Not a substitute for licensed medical judgment.',
  };
}

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// 1. Process patient symptoms through the 5 agents
app.post('/api/triage/process', async (req, res) => {
  try {
    const { input, patientName, age, reportedOnset, reportedSeverity } = req.body;
    if (!input || typeof input !== 'string') {
      res.status(400).json({ error: 'Patient input text is required' });
      return;
    }

    const result = await runFiveAgentPipeline({
      rawInput: input,
      patientName: patientName || 'Anonymous Patient',
      age: age ? Number(age) : 42,
      reportedOnset: reportedOnset || '1 hour ago',
      reportedSeverity: reportedSeverity ? Number(reportedSeverity) : 6,
    });

    // Automatically record in hospital triage queue
    const queueEntry: QueuePatient = {
      id: `pt-${Date.now().toString().slice(-4)}`,
      patientName: result.patientInput.patientName || 'Anonymous',
      symptoms: result.patientInput.rawInput,
      onset: result.patientInput.onset,
      severity: result.patientInput.severityScore,
      tier: result.tier,
      esiLevel: result.esiLevel,
      matchedDepartment: result.isEmergency ? 'Emergency ED / Trauma' : (result.specialist?.department || 'General Practice'),
      matchedDoctor: result.isEmergency ? 'Emergency Resuscitation Team' : result.specialist?.doctorName,
      scheduledTime: result.isEmergency ? 'Immediate ED Triage (0 min)' : undefined,
      status: result.isEmergency ? 'Dispatched to ED' : 'Evaluating',
      createdAt: 'Just now',
      traditionalWaitDays: result.tier === 'EMERGENCY' ? 4 : (result.tier === 'URGENT' ? 5 : 4),
      agenticWaitHours: result.tier === 'EMERGENCY' ? 0 : (result.tier === 'URGENT' ? 24 : 96),
    };

    // Prepend to top of hospital queue
    hospitalQueue.unshift(queueEntry);

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/triage/process:', error);
    res.status(500).json({ error: 'Internal triage processing error', details: error?.message });
  }
});

// 2. Book appointment slot
app.post('/api/triage/book', (req, res) => {
  try {
    const { slotId, patientName, patientPhone, patientEmail, triageResult } = req.body;
    if (!slotId || !triageResult) {
      res.status(400).json({ error: 'slotId and triageResult are required' });
      return;
    }

    const selectedSlot = triageResult.availableSlots?.find((s: any) => s.id === slotId) || triageResult.availableSlots?.[0];
    const bookingReference = `HLT-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update patient queue status
    const queueIndex = hospitalQueue.findIndex((p) => p.patientName === (patientName || triageResult.patientInput?.patientName));
    if (queueIndex !== -1) {
      hospitalQueue[queueIndex].status = triageResult.tier === 'URGENT' ? 'Scheduled Fast-Track' : 'Scheduled Standard';
      hospitalQueue[queueIndex].scheduledTime = `${selectedSlot?.displayDate || 'Upcoming'} at ${selectedSlot?.displayTime || '09:00 AM'}`;
    }

    res.json({
      success: true,
      bookingId: bookingReference,
      patientName: patientName || triageResult.patientInput?.patientName || 'Patient',
      patientPhone: patientPhone || '(555) 019-2834',
      patientEmail: patientEmail || 'patient@example.com',
      slot: selectedSlot,
      department: triageResult.specialist?.department,
      doctorName: triageResult.specialist?.doctorName,
      location: triageResult.specialist?.clinicLocation,
      urgencyTier: triageResult.tier,
      confirmationMessage: `Confirmed appointment with ${triageResult.specialist?.doctorName} for ${selectedSlot?.displayDate} at ${selectedSlot?.displayTime}.`,
      bookedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Booking failed', details: err?.message });
  }
});

// 3. Get hospital queue and impact statistics
app.get('/api/hospital/queue', (req, res) => {
  const emergencies = hospitalQueue.filter((p) => p.tier === 'EMERGENCY').length;
  const urgent = hospitalQueue.filter((p) => p.tier === 'URGENT').length;
  const routine = hospitalQueue.filter((p) => p.tier === 'ROUTINE').length;

  // Calculate simulated hours saved vs traditional first-come first-served
  const preventedDelayHours = hospitalQueue.reduce((acc, p) => {
    if (p.tier === 'EMERGENCY') return acc + (p.traditionalWaitDays * 24);
    if (p.tier === 'URGENT') return acc + ((p.traditionalWaitDays * 24) - p.agenticWaitHours);
    return acc;
  }, 0);

  res.json({
    patients: hospitalQueue,
    stats: {
      activeQueueCount: hospitalQueue.length,
      emergencyEscalations: emergencies,
      urgentFastTrack: urgent,
      routineScheduled: routine,
      preventedDelayHours: Math.round(preventedDelayHours),
    },
  });
});

// 4. Reset hospital queue to seed data
app.post('/api/hospital/reset', (req, res) => {
  hospitalQueue = [...INITIAL_HOSPITAL_QUEUE];
  res.json({ success: true, count: hospitalQueue.length });
});

// ----------------------------------------------------
// VITE SPA / STATIC SERVER
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TriageAI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start();
