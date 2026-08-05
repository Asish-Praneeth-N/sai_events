"use client";

import { useState } from "react";
import { Phone, Clock, CheckCircle2, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpeakWithTeamModal({ isOpen, onClose }: Props) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredTime, setPreferredTime] = useState("Morning (9 AM - 12 PM)");
  const [notes, setNotes] = useState("");
  
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) return;

    const ref = `SAI-CALL-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedRef(ref);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-[#f8f2e9] border border-[#173d2c]/15 max-w-md w-full overflow-hidden p-6 sm:p-8 space-y-6 shadow-[0_24px_80px_rgba(70,45,22,0.15)] animate-scale-in relative dark:border-white/[0.10] dark:bg-[#171914] dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#173d2c]/40 hover:text-[#173d2c] p-1.5 hover:bg-[#173d2c]/[0.04] cursor-pointer dark:text-white/35 dark:hover:text-[#f0e8db] dark:hover:bg-white/[0.04]"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedRef ? (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="w-14 h-14 border border-[#173d2c]/15 bg-[#143d2b]/[0.08] text-[#143d2b] flex items-center justify-center mx-auto dark:border-white/[0.10] dark:bg-[#d2b56b]/[0.10] dark:text-[#d2b56b]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-[7.5px] uppercase font-bold tracking-[0.24em] text-[#a17a34] dark:text-[#d2b56b]">Callback Scheduled</span>
              <h3 className="text-xl font-normal font-heading text-[#173d2c] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                Thank You, {fullName}!
              </h3>
              <p className="text-xs text-[#173d2c]/65 leading-relaxed dark:text-[#eee5d7]/55">
                Your callback request has been registered with reference ID:
              </p>
              <div className="text-base font-bold font-mono text-[#a17a34] dark:text-[#d2b56b] pt-1">{submittedRef}</div>
            </div>

            <p className="text-xs text-[#173d2c]/70 bg-[#f3eadf]/50 p-3.5 border border-[#173d2c]/10 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-[#eee5d7]/60">
              Our Senior Event Coordinator will call you at <strong className="text-[#173d2c] dark:text-[#f0e8db]">{phoneNumber}</strong> during {preferredTime}.
            </p>

            <button
              onClick={() => {
                setSubmittedRef(null);
                onClose();
              }}
              className="w-full py-3 bg-[#143d2b] text-[#fffaf1] font-bold text-[8px] uppercase tracking-[0.2em] cursor-pointer shadow-md dark:bg-[#d2b56b] dark:text-[#161812]"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                <h3 className="text-xl font-normal font-heading text-[#173d2c] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Speak With Our Team
                </h3>
              </div>
              <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-light">
                Request an instant callback from a Senior SAI EVENTS Concierge.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[7.5px] font-bold uppercase tracking-[0.2em] text-[#173d2c]/55 dark:text-[#eee5d7]/45">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Asish Praneeth"
                  className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] dark:focus:border-[#d2b56b]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[7.5px] font-bold uppercase tracking-[0.2em] text-[#173d2c]/55 dark:text-[#eee5d7]/45">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] dark:focus:border-[#d2b56b]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[7.5px] font-bold uppercase tracking-[0.2em] text-[#173d2c]/55 dark:text-[#eee5d7]/45">Preferred Callback Slot</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-[#171914] dark:text-[#f0e8db] dark:focus:border-[#d2b56b]"
                >
                  <option value="Immediate (As soon as possible)">Immediate (As soon as possible)</option>
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[7.5px] font-bold uppercase tracking-[0.2em] text-[#173d2c]/55 dark:text-[#eee5d7]/45">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Briefly state your event query or occasion..."
                  className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] dark:focus:border-[#d2b56b] resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3 justify-end border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-[#173d2c]/15 text-[#173d2c] text-[8px] font-bold uppercase tracking-[0.18em] hover:bg-[#173d2c]/[0.035] cursor-pointer dark:border-white/[0.10] dark:text-[#f0e8db] dark:hover:bg-white/[0.035]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#143d2b] text-[#fffaf1] font-bold text-[8px] uppercase tracking-[0.18em] cursor-pointer shadow-md hover:bg-[#174631] dark:bg-[#d2b56b] dark:text-[#161812] dark:hover:bg-[#dfc580]"
                >
                  Request Callback
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
