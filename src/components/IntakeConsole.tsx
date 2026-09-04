import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Clock,
  Gauge,
  User,
  RotateCcw,
  Bot,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PRESET_SCENARIOS, TestScenario } from '../data/clinicalProtocols';
import { PatientInputData } from '../types';

interface IntakeConsoleProps {
  onSubmit: (data: {
    input: string;
    patientName: string;
    age: number;
    reportedOnset: string;
    reportedSeverity: number;
  }) => void;
  isProcessing: boolean;
  onReset: () => void;
  lastPatientInput?: PatientInputData;
}

export const IntakeConsole: React.FC<IntakeConsoleProps> = ({
  onSubmit,
  isProcessing,
  onReset,
  lastPatientInput,
}) => {
  const [inputText, setInputText] = useState('');
  const [patientName, setPatientName] = useState('David Miller');
  const [age, setAge] = useState(54);
  const [reportedOnset, setReportedOnset] = useState('1 hour ago');
  const [reportedSeverity, setReportedSeverity] = useState(8);
  const [isListening, setIsListening] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('chest-sob');
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  // Set default preset scenario on mount
  useEffect(() => {
    const defaultPreset = PRESET_SCENARIOS[0];
    if (defaultPreset) {
      setInputText(defaultPreset.input);
      setPatientName(defaultPreset.patientName);
      setAge(defaultPreset.age);
      setReportedOnset(defaultPreset.defaultOnset);
      setReportedSeverity(defaultPreset.defaultSeverity);
    }
  }, []);

  const handleSelectPreset = (preset: TestScenario) => {
    setSelectedPresetId(preset.id);
    setInputText(preset.input);
    setPatientName(preset.patientName);
    setAge(preset.age);
    setReportedOnset(preset.defaultOnset);
    setReportedSeverity(preset.defaultSeverity);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type symptoms manually.');
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
      }
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    onSubmit({
      input: inputText.trim(),
      patientName: patientName.trim() || 'Patient',
      age: Number(age) || 45,
      reportedOnset,
      reportedSeverity: Number(reportedSeverity),
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Intake header */}
      <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-serif">
              Patient Symptom Intake Console
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Agent 01: Conversational Parsing & Clinical Entity Extraction
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setInputText('');
            setSelectedPresetId('');
            onReset();
          }}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Preset Test Scenarios */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Select Example Scenarios:</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">1-click simulation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {PRESET_SCENARIOS.slice(0, 6).map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const isEmergency = preset.category === 'Emergency';
            const isUrgent = preset.category === 'Urgent';

            return (
              <button
                key={preset.id}
                type="button"
                id={`preset-${preset.id}`}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/90 text-teal-950 font-medium ring-1 ring-teal-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-semibold truncate">{preset.label}</span>
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${
                      isEmergency
                        ? 'bg-rose-100 text-rose-800'
                        : isUrgent
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {preset.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">
                  {preset.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Conversational Intake Form */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="symptom-input"
              className="text-xs font-semibold text-slate-800 flex items-center gap-1.5"
            >
              <span>Describe Patient Symptoms</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Natural language or transcribed intake
            </span>
          </div>

          <div className="relative">
            <textarea
              id="symptom-input"
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. I've had heavy chest tightness for the last hour and feel short of breath sitting still..."
              className="w-full p-3 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white placeholder-slate-400 resize-none font-sans leading-relaxed shadow-inner"
              required
            />

            {/* Voice Dictation Button */}
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
              <button
                type="button"
                id="voice-dictation-btn"
                onClick={handleVoiceInput}
                title={isListening ? 'Stop listening' : 'Dictate symptoms by voice'}
                className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Parameters: Onset Duration & Severity Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Symptom Onset Timeline:</span>
            </label>
            <select
              id="symptom-onset-select"
              value={reportedOnset}
              onChange={(e) => setReportedOnset(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="15 minutes ago">&lt; 30 minutes (Acute sudden onset)</option>
              <option value="1 hour ago">1 hour ago (Challenge benchmark)</option>
              <option value="2-4 hours ago">2 - 4 hours ago</option>
              <option value="12-24 hours ago">12 - 24 hours ago</option>
              <option value="2-3 days ago">2 - 3 days ago</option>
              <option value="1-2 weeks ago">&gt; 1 week (Sub-acute)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-500" />
                <span>Patient Discomfort Severity:</span>
              </label>
              <span
                className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded ${
                  reportedSeverity >= 8
                    ? 'bg-rose-100 text-rose-800'
                    : reportedSeverity >= 5
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {reportedSeverity} / 10
              </span>
            </div>
            <input
              id="severity-slider"
              type="range"
              min={1}
              max={10}
              value={reportedSeverity}
              onChange={(e) => setReportedSeverity(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 (Mild)</span>
              <span>5 (Moderate)</span>
              <span>10 (Severe)</span>
            </div>
          </div>
        </div>

        {/* Patient Profile Context (Expandable) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {showAdvancedDetails
                ? 'Hide Patient Demographic Details'
                : 'Edit Patient Name & Age (Optional)'}
            </span>
          </button>

          {showAdvancedDetails && (
            <div className="mt-2.5 grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white"
                  placeholder="e.g. David Miller"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white"
                  placeholder="e.g. 54"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="run-triage-btn"
            disabled={!inputText.trim() || isProcessing}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isProcessing
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800 text-white shadow-md hover:shadow-lg active:scale-[0.99]'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Agents Deliberating (Evaluating Protocols)...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Execute 5-Agent Triage Pipeline</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
