import { ProtocolRuleMatch, SpecialistMatch, TimeSlot, QueuePatient } from '../types';

export interface TestScenario {
  id: string;
  label: string;
  category: 'Emergency' | 'Urgent' | 'Routine';
  patientName: string;
  age: number;
  input: string;
  defaultSeverity: number;
  defaultOnset: string;
  tag: string;
}

export const PRESET_SCENARIOS: TestScenario[] = [
  {
    id: 'chest-sob',
    label: 'Chest Tightness + SOB (1h)',
    category: 'Emergency',
    patientName: 'David Miller',
    age: 54,
    input: "I've had heavy chest tightness for the last hour and I feel short of breath even sitting still.",
    defaultSeverity: 9,
    defaultOnset: '1 hour ago',
    tag: 'Cardiac / Ischemia',
  },
  {
    id: 'stroke-fast',
    label: 'Facial Droop + Slurred Speech',
    category: 'Emergency',
    patientName: 'Eleanor Vance',
    age: 68,
    input: 'My face is drooping on the left side and my speech suddenly became slurred about 20 minutes ago.',
    defaultSeverity: 10,
    defaultOnset: '20 minutes ago',
    tag: 'Neurology / Stroke FAST',
  },
  {
    id: 'anaphylaxis',
    label: 'Throat Swelling + Hives',
    category: 'Emergency',
    patientName: 'Lucas Morales',
    age: 29,
    input: 'My throat feels like it is closing, lips are swelling and I have severe hives after eating seafood 15 mins ago.',
    defaultSeverity: 10,
    defaultOnset: '15 minutes ago',
    tag: 'Immuno / Anaphylaxis',
  },
  {
    id: 'high-fever-vomiting',
    label: 'High Fever + Intractable Vomiting',
    category: 'Urgent',
    patientName: 'Sophia Patel',
    age: 34,
    input: "I've had a fever of 39.4°C for two days and I can't keep any water or food down without throwing up.",
    defaultSeverity: 7,
    defaultOnset: '2 days ago',
    tag: 'Infectious / GI',
  },
  {
    id: 'deep-laceration',
    label: 'Deep Hand Laceration',
    category: 'Urgent',
    patientName: 'Marcus Wright',
    age: 41,
    input: 'Cut my left hand deeply on broken glass 45 mins ago. Bleeding slowed with pressure but edges gaping, needs stitches.',
    defaultSeverity: 6,
    defaultOnset: '45 minutes ago',
    tag: 'Trauma / Surgery',
  },
  {
    id: 'acute-migraine',
    label: 'Severe Migraine with Aura',
    category: 'Urgent',
    patientName: 'Chloe Bennett',
    age: 31,
    input: 'Intense throbbing headache on right temple with blind spots and extreme light sensitivity for 5 hours.',
    defaultSeverity: 7,
    defaultOnset: '5 hours ago',
    tag: 'Neurology',
  },
  {
    id: 'mild-cold',
    label: 'Mild Sore Throat & Runny Nose',
    category: 'Routine',
    patientName: 'James Wilson',
    age: 26,
    input: 'I have had a mild sore throat, slightly runny nose, and minor sneezing for the past 3 days. No fever.',
    defaultSeverity: 3,
    defaultOnset: '3 days ago',
    tag: 'General Practice',
  },
  {
    id: 'back-strain',
    label: 'Lumbar Strain from Gardening',
    category: 'Routine',
    patientName: 'Robert Hayes',
    age: 62,
    input: 'Dull ache in lower back after lifting mulch bags in the garden yesterday. Normal leg sensation, just tight.',
    defaultSeverity: 4,
    defaultOnset: '1 day ago',
    tag: 'Orthopedics / PT',
  },
  {
    id: 'mild-rash',
    label: 'Itchy Dry Skin Rash',
    category: 'Routine',
    patientName: 'Amara Johnson',
    age: 22,
    input: 'Noticed a mild dry patchy rash on my inner elbow that itches occasionally. Has been there for about a week.',
    defaultSeverity: 2,
    defaultOnset: '1 week ago',
    tag: 'Dermatology',
  },
];

export const CLINICAL_RULES = [
  // Emergency Tier Rules
  {
    ruleId: 'CARD-RESP-1',
    name: 'Acute Coronary Syndrome / Cardiopulmonary Compromise',
    protocolSystem: 'Manchester Triage' as const,
    tier: 'EMERGENCY' as const,
    esiLevel: 2 as const,
    triggers: [
      /(chest (tightness|pain|pressure|heaviness|discomfort|crushing))/i,
      /(short(ness)? of breath|breathless|can'?t breathe|difficult(y)? breathing|hard to breathe|gasping)/i,
    ],
    criteria: 'Chest discomfort accompanied by shortness of breath, sudden onset < 24h',
    clinicalRationale: 'High probability of acute coronary syndrome (ACS), pulmonary embolism, or acute decompensated heart failure requiring immediate ECG, troponin, and resuscitation readiness.',
  },
  {
    ruleId: 'NEURO-FAST-1',
    name: 'Acute Cerebrovascular Event (Stroke FAST criteria)',
    protocolSystem: 'Emergency Severity Index (ESI)' as const,
    tier: 'EMERGENCY' as const,
    esiLevel: 1 as const,
    triggers: [
      /(face( is)? droop|facial droop|one side of (my |the )?face|slurred speech|arm weakness|can'?t lift (my |one )?arm|sudden confusion|loss of balance|loss of vision)/i,
    ],
    criteria: 'Facial asymmetry, unilateral arm drift, or acute speech impediment',
    clinicalRationale: 'Time-critical stroke pathway. Thrombolysis / thrombectomy window is active (<4.5 hours from last known normal). Immediate CT head required.',
  },
  {
    ruleId: 'ALLERGY-ANAPH-1',
    name: 'Severe Systemic Anaphylaxis / Airway Compromise',
    protocolSystem: 'Manchester Triage' as const,
    tier: 'EMERGENCY' as const,
    esiLevel: 1 as const,
    triggers: [
      /(throat (swelling|closing|feels tight)|tongue (swelling|swollen)|lip (swelling|swollen)|stridor|swallowing difficulty|hives.*breath|breath.*hives)/i,
    ],
    criteria: 'Rapid-onset mucosal swelling with respiratory distress or systemic urticaria',
    clinicalRationale: 'Imminent loss of patent airway. Requires intramuscular epinephrine 0.3mg immediately and continuous hemodynamic monitoring.',
  },
  {
    ruleId: 'HEM-MASSIVE-1',
    name: 'Uncontrolled / Arterial Hemorrhage',
    protocolSystem: 'Emergency Severity Index (ESI)' as const,
    tier: 'EMERGENCY' as const,
    esiLevel: 1 as const,
    triggers: [
      /(uncontrolled bleeding|can'?t stop bleeding|spurting blood|arterial bleed|blood pooling|soaking through towels)/i,
    ],
    criteria: 'Active profuse bleeding refractory to direct manual pressure',
    clinicalRationale: 'High risk of hypovolemic shock, requiring tourniquet/hemostatic dressing and rapid surgical intervention.',
  },
  {
    ruleId: 'CONSC-ALTERED-1',
    name: 'Unresponsiveness or Altered Mental Status',
    protocolSystem: 'Manchester Triage' as const,
    tier: 'EMERGENCY' as const,
    esiLevel: 1 as const,
    triggers: [
      /(unconscious|passed out|fainted and won'?t wake|unresponsive|collapsed|incoherent and disoriented)/i,
    ],
    criteria: 'Glasgow Coma Scale < 13 or persistent loss of consciousness',
    clinicalRationale: 'Compromised airway protection, risk of hypoxemia, hypoglycemia, severe intoxication, or intracranial pathology.',
  },
  {
    ruleId: 'MH-CRISIS-1',
    name: 'Active Suicidal Ideation with Plan/Intent',
    protocolSystem: 'Emergency Severity Index (ESI)' as const,
    tier: 'EMERGENCY' as const,
    esiLevel: 2 as const,
    triggers: [
      /(suicid(e|al)|end(ing)? my life|kill(ing)? myself|want to die|hurt myself|have a plan to end)/i,
    ],
    criteria: 'Expressed imminent suicidal intent with plan or self-harm urgency',
    clinicalRationale: 'Immediate patient safety risk requiring crisis de-escalation, 1-to-1 observation, and direct behavioral health ED intake.',
  },

  // Urgent Tier Rules
  {
    ruleId: 'GI-FEB-1',
    name: 'High Pyrexia with Dehydration Risk',
    protocolSystem: 'Manchester Triage' as const,
    tier: 'URGENT' as const,
    esiLevel: 3 as const,
    triggers: [
      /(fever|39\.[0-9]|10[2-4]\.[0-9]|chills)/i,
      /(vomit|throw(ing)? up|can'?t keep (food|water|anything) down|diarrhea)/i,
    ],
    criteria: 'Temperature >= 39°C with gastrointestinal fluid loss and intolerance to oral rehydration',
    clinicalRationale: 'Risk of hypovolemia, electrolyte derangement, and systemic bacteremia. Requires IV fluids, antiemetics, and metabolic panel within 24 hours.',
  },
  {
    ruleId: 'TRAUMA-LAC-1',
    name: 'Full-Thickness Laceration (Bleeding Controlled)',
    protocolSystem: 'Emergency Severity Index (ESI)' as const,
    tier: 'URGENT' as const,
    esiLevel: 4 as const,
    triggers: [
      /(deep cut|laceration|gaping wound|needs stitches|cut from glass|cut from knife)/i,
    ],
    criteria: 'Laceration through subcutaneous tissue requiring surgical closure within golden 12-hour window',
    clinicalRationale: 'Primary closure needed within 12-18 hours to minimize infection and optimize cosmesis/function.',
  },
  {
    ruleId: 'NEURO-MIGRAINE-1',
    name: 'Acute Refractory Cephalea with Neurological Deficit/Aura',
    protocolSystem: 'Manchester Triage' as const,
    tier: 'URGENT' as const,
    esiLevel: 3 as const,
    triggers: [
      /(severe headache|worst headache|migraine|throbbing head)/i,
      /(vision|aura|blind spots|photophobia|light sensitivity)/i,
    ],
    criteria: 'Severe unremitting headache accompanied by visual disturbances or focal neurological aura',
    clinicalRationale: 'Needs expedited assessment to differentiate status migrainosus from acute neurological causes.',
  },
  {
    ruleId: 'ABD-ACUTE-1',
    name: 'Acute Localized Abdominal Distress',
    protocolSystem: 'Emergency Severity Index (ESI)' as const,
    tier: 'URGENT' as const,
    esiLevel: 3 as const,
    triggers: [
      /(severe abdominal pain|stomach pain getting worse|sharp belly pain|right lower quadrant|tender abdomen)/i,
    ],
    criteria: 'Progressive abdominal pain with focal tenderness',
    clinicalRationale: 'Evaluation for acute abdomen (appendicitis, cholecystitis, diverticulitis) via ultrasound/CT.',
  },

  // Routine Tier Rules
  {
    ruleId: 'RESP-URI-ROUTINE',
    name: 'Uncomplicated Upper Respiratory Infection',
    protocolSystem: 'Manchester Triage' as const,
    tier: 'ROUTINE' as const,
    esiLevel: 5 as const,
    triggers: [
      /(sore throat|runny nose|cold symptoms|mild cough|stuffy nose|congestion|sneezing)/i,
    ],
    criteria: 'Mild viral symptoms without tachypnea, stridor, or high fever',
    clinicalRationale: 'Conservative symptomatic management; outpatient primary care or telehealth within 3-5 days.',
  },
  {
    ruleId: 'MSK-STRAIN-ROUTINE',
    name: 'Uncomplicated Musculoskeletal Strain',
    protocolSystem: 'Emergency Severity Index (ESI)' as const,
    tier: 'ROUTINE' as const,
    esiLevel: 5 as const,
    triggers: [
      /(back ache|back pain after|pulled muscle|sore joint|stiff neck|sprained ankle|knee stiffness)/i,
    ],
    criteria: 'Mechanical pain related to exertion without neurological deficit or inability to bear weight',
    clinicalRationale: 'Outpatient physical therapy or orthopedics consultation within standard scheduling window.',
  },
  {
    ruleId: 'DERM-MILD-ROUTINE',
    name: 'Non-Urgent Dermatological Eruption',
    protocolSystem: 'Manchester Triage' as const,
    tier: 'ROUTINE' as const,
    esiLevel: 5 as const,
    triggers: [
      /(rash|dry skin|acne|eczema|itchy patch|mole check)/i,
    ],
    criteria: 'Localized non-spreading dermatosis without systemic toxicity',
    clinicalRationale: 'Outpatient dermatology clinic evaluation.',
  },
];

export const SPECIALIST_DIRECTORY: Record<string, {
  name: string;
  title: string;
  department: string;
  subspecialty: string;
  clinicLocation: string;
  telehealthAvailable: boolean;
}> = {
  Cardiology: {
    name: 'Dr. Sarah Lin, MD, FACC',
    title: 'Senior Interventional Cardiologist',
    department: 'Cardiovascular Medicine',
    subspecialty: 'Acute Coronary & Ischemic Heart Disease',
    clinicLocation: 'Heart & Vascular Pavilion, Suite 402',
    telehealthAvailable: false,
  },
  Pulmonology: {
    name: 'Dr. Robert Chen, MD, FCCP',
    title: 'Pulmonary & Critical Care Specialist',
    department: 'Pulmonary Medicine',
    subspecialty: 'Airway Disorders & Asthma',
    clinicLocation: 'Respiratory Health Center, Wing B',
    telehealthAvailable: true,
  },
  Neurology: {
    name: 'Dr. Marcus Thorne, MD, PhD',
    title: 'Consultant Neurologist',
    department: 'Neurology & Stroke Center',
    subspecialty: 'Headache Medicine & Neurovascular',
    clinicLocation: 'Neurosciences Institute, Level 3',
    telehealthAvailable: true,
  },
  Gastroenterology: {
    name: 'Dr. Elena Rostova, MD',
    title: 'Attending Gastroenterologist',
    department: 'Digestive Disease Center',
    subspecialty: 'Acute Abdominal & Hepatobiliary',
    clinicLocation: 'Endoscopy & GI Outpatient Clinic, Tower A',
    telehealthAvailable: true,
  },
  Surgery: {
    name: 'Dr. David Kim, MD, FACS',
    title: 'Trauma & Acute Care Surgeon',
    department: 'Emergency & General Surgery',
    subspecialty: 'Wound Reconstruction & Acute Care',
    clinicLocation: 'Urgent Surgical Care Clinic, Room 112',
    telehealthAvailable: false,
  },
  Orthopedics: {
    name: 'Dr. Rachel Adams, MD',
    title: 'Orthopedic Spine & Sports Specialist',
    department: 'Orthopedics & Sports Medicine',
    subspecialty: 'Musculoskeletal Rehabilitation',
    clinicLocation: 'Orthopedic Pavilion, 2nd Floor',
    telehealthAvailable: true,
  },
  ENT: {
    name: 'Dr. Tariq Al-Mansoor, MD',
    title: 'Otolaryngologist',
    department: 'Ear, Nose & Throat Center',
    subspecialty: 'Head, Neck & Upper Airway',
    clinicLocation: 'Ambulatory Care Center, Suite 105',
    telehealthAvailable: true,
  },
  Dermatology: {
    name: 'Dr. Maya Patel, MD',
    title: 'Clinical Dermatologist',
    department: 'Dermatology & Skin Center',
    subspecialty: 'Inflammatory Skin Diseases',
    clinicLocation: 'West Wing Dermatology Clinic, Suite 308',
    telehealthAvailable: true,
  },
  'General Practice': {
    name: 'Dr. Julian Foster, MD',
    title: 'Family & Internal Medicine Physician',
    department: 'Primary Care & Preventive Medicine',
    subspecialty: 'Comprehensive Adult Outpatient Care',
    clinicLocation: 'Main Outpatient Clinic, Floor 1',
    telehealthAvailable: true,
  },
};

export function generateAvailableSlots(department: string, tier: 'URGENT' | 'ROUTINE'): TimeSlot[] {
  const doctor = SPECIALIST_DIRECTORY[department] || SPECIALIST_DIRECTORY['General Practice'];
  const slots: TimeSlot[] = [];
  const now = new Date();

  // Urgent: fast-track within 24 - 48 hours
  // Routine: 3 to 7 days
  const dayOffsets = tier === 'URGENT' ? [1, 1, 2] : [3, 4, 5, 7];
  const times = ['08:30 AM', '10:15 AM', '01:45 PM', '04:00 PM'];

  dayOffsets.forEach((offset, idx) => {
    const slotDate = new Date(now);
    slotDate.setDate(now.getDate() + offset);
    const dateStr = slotDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = times[idx % times.length];

    slots.push({
      id: `slot-${tier.toLowerCase()}-${offset}-${idx}`,
      datetime: slotDate.toISOString(),
      displayDate: dateStr,
      displayTime: timeStr,
      doctorName: doctor.name,
      department: doctor.department,
      type: (doctor.telehealthAvailable && idx % 2 === 1) ? 'telehealth' : 'in-person',
      room: doctor.clinicLocation,
      isUrgencyFastTrack: tier === 'URGENT',
    });
  });

  return slots;
}

export const INITIAL_HOSPITAL_QUEUE: QueuePatient[] = [
  {
    id: 'pt-8901',
    patientName: 'Patricia Gomez',
    symptoms: 'Crushing retrosternal chest pain + diaphoresis, onset 30 mins',
    onset: '30 mins ago',
    severity: 10,
    tier: 'EMERGENCY',
    esiLevel: 1,
    matchedDepartment: 'Cardiology / Emergency ED',
    matchedDoctor: 'Dr. Sarah Lin (Immediate ED Bay 1)',
    scheduledTime: 'Immediate Direct ED Transfer',
    status: 'Dispatched to ED',
    createdAt: '10 mins ago',
    traditionalWaitDays: 4, // in FCFS would be waiting days!
    agenticWaitHours: 0,
  },
  {
    id: 'pt-8902',
    patientName: 'Kenneth Brooks',
    symptoms: 'Sudden right arm weakness and difficulty speaking',
    onset: '45 mins ago',
    severity: 9,
    tier: 'EMERGENCY',
    esiLevel: 1,
    matchedDepartment: 'Neurology / Stroke Team',
    matchedDoctor: 'Dr. Marcus Thorne (Stroke Bay)',
    scheduledTime: 'Code Stroke Protocol Activated',
    status: 'Dispatched to ED',
    createdAt: '25 mins ago',
    traditionalWaitDays: 6,
    agenticWaitHours: 0,
  },
  {
    id: 'pt-8903',
    patientName: 'Samantha Wu',
    symptoms: 'Persistent fever 39.8°C with intractable vomiting 24h',
    onset: '24 hours ago',
    severity: 8,
    tier: 'URGENT',
    esiLevel: 3,
    matchedDepartment: 'Gastroenterology / Urgent Care',
    matchedDoctor: 'Dr. Elena Rostova',
    scheduledTime: 'Tomorrow, 09:00 AM (Priority Fast-Track)',
    status: 'Scheduled Fast-Track',
    createdAt: '1 hour ago',
    traditionalWaitDays: 5,
    agenticWaitHours: 18,
  },
  {
    id: 'pt-8904',
    patientName: 'Brian Taylor',
    symptoms: 'Deep forearm glass laceration, bleeding stopped with bandage',
    onset: '1 hour ago',
    severity: 7,
    tier: 'URGENT',
    esiLevel: 4,
    matchedDepartment: 'Surgery / Wound Clinic',
    matchedDoctor: 'Dr. David Kim',
    scheduledTime: 'Today, 02:30 PM (Urgent Closure)',
    status: 'Scheduled Fast-Track',
    createdAt: '1.5 hours ago',
    traditionalWaitDays: 3,
    agenticWaitHours: 3,
  },
  {
    id: 'pt-8905',
    patientName: 'Emily Clarke',
    symptoms: 'Slight runny nose and dry tickly cough for 4 days',
    onset: '4 days ago',
    severity: 2,
    tier: 'ROUTINE',
    esiLevel: 5,
    matchedDepartment: 'General Practice',
    matchedDoctor: 'Dr. Julian Foster',
    scheduledTime: 'In 4 days, 11:30 AM',
    status: 'Scheduled Standard',
    createdAt: '3 hours ago',
    traditionalWaitDays: 4,
    agenticWaitHours: 96,
  },
];
