"use client";

import { useState } from "react";
import { saveCustomerProfile } from "../actions";

interface CustomerProfileFormProps {
  initialProfile: {
    fullName: string;
    phoneNumber: string;
    address: string;
  };
}

export default function CustomerProfileForm({
  initialProfile,
}: CustomerProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(initialProfile.phoneNumber);
  const [address, setAddress] = useState(initialProfile.address);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (phoneNumber.length < 10) {
        throw new Error("Phone number must be at least 10 digits.");
      }

      await saveCustomerProfile({
        fullName,
        phoneNumber,
        address,
      });

      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl animate-fade-in-up">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl animate-fade-in">
          {error}
        </div>
      )}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl animate-fade-in">
          {message}
        </div>
      )}

      <div className="p-6 md:p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">My Contact Information</h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Provide your updated contact information. This is used by coordinators and vendors to contact you.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Home / Event Location Address
            </label>
            <textarea
              id="address"
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your street address, city, and pin code"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow shadow-purple-950/20 hover:scale-[1.01] cursor-pointer text-sm"
        >
          {loading ? "Saving Changes..." : "Save Profile Details"}
        </button>
      </div>
    </form>
  );
}
