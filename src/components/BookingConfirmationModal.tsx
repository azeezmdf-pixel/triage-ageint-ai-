import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Building2,
  Phone,
  Download,
  X,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { TimeSlot, TriageTier } from '../types';

interface BookingConfirmationModalProps {
  bookingData: {
    bookingId: string;
    patientName: string;
    patientPhone: string;
    slot: TimeSlot;
    department: string;
    doctorName: string;
    location: string;
    urgencyTier: TriageTier;
  };
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  bookingData,
  onClose,
}) => {
  const downloadCalendarEvent = () => {
    const { slot, doctorName, department, location, bookingId } = bookingData;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TriageAI Hospital System//HLT-02//EN
BEGIN:VEVENT
UID:${bookingId}@triageai.hospital
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Medical Appointment with ${doctorName} (${department})
DESCRIPTION:Confirmed triage booking Ref: ${bookingId}. Department: ${department}.
LOCATION:${location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appointment-${bookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Banner */}
        <div className="bg-teal-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-600/50 cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white text-teal-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold font-serif">Appointment Confirmed</h3>
          <p className="text-xs text-teal-100 font-mono mt-1">
            Booking Reference: <strong className="text-white">{bookingData.bookingId}</strong>
          </p>
        </div>

        {/* Modal Body / Digital Boarding Pass */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Patient:</span>
              <strong className="text-slate-900 font-semibold">{bookingData.patientName}</strong>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Physician:</span>
              <strong className="text-slate-900 font-semibold">{bookingData.doctorName}</strong>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Department:</span>
              <span className="text-slate-800">{bookingData.department}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Scheduled Time:</span>
              <strong className="text-teal-800 font-bold">
                {bookingData.slot.displayDate} • {bookingData.slot.displayTime}
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Clinic Location:</span>
              <span className="text-slate-700 text-right">{bookingData.location}</span>
            </div>
          </div>

          {/* SMS Notification Banner */}
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              SMS reminder dispatched to <strong>{bookingData.patientPhone}</strong>. Check-in directions sent.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              id="download-calendar-btn"
              onClick={downloadCalendarEvent}
              className="flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Add to Calendar (.ics)</span>
            </button>

            <button
              type="button"
              id="close-confirmation-btn"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
