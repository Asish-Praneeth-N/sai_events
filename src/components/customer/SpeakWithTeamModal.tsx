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
      <div className="bg-surface border border-accent-gold/40 rounded-3xl max-w-md w-full overflow-hidden p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-surface-raised cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedRef ? (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold">Callback Scheduled</span>
              <h3 className="text-xl font-bold font-heading text-foreground">Thank You, {fullName}!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your callback request has been registered with reference ID:
              </p>
              <div className="text-base font-bold font-mono text-accent-gold pt-1">{submittedRef}</div>
            </div>

            <p className="text-xs text-muted-foreground bg-background p-3.5 rounded-xl border border-border">
              Our Senior Event Coordinator will call you at <strong className="text-foreground">{phoneNumber}</strong> during {preferredTime}.
            </p>

            <button
              onClick={() => {
                setSubmittedRef(null);
                onClose();
              }}
              className="w-full py-3 bg-accent-gold text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-accent-gold" />
                <h3 className="text-lg font-bold font-heading text-foreground">Speak With Our Team</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Request an instant callback from a Senior SAI EVENTS Concierge.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Asish Praneeth"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Preferred Callback Slot</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                >
                  <option value="Immediate (As soon as possible)">Immediate (As soon as possible)</option>
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Briefly state your event query or occasion..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3 justify-end border-t border-border/40">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-surface hover:bg-surface-raised border border-border text-foreground font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl cursor-pointer shadow-md"
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
