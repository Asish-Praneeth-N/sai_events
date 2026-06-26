"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveVendorProfile, updateVendorCategoryMappings } from "../actions";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface VendorProfileFormProps {
  initialProfile: {
    fullName: string;
    phoneNumber: string;
    businessName: string;
    address: string;
    email: string;
  };
  categories: Category[];
  initialMappings: string[];
}

// ─── Inline Toast ───────────────────────────────────────────────────
type ToastType = "success" | "error";
function Toast({ message, type, onDismiss }: { message: string; type: ToastType; onDismiss: () => void }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm animate-slide-down ${
        type === "success"
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
          : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400"
      }`}
    >
      {type === "success" ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      )}
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="ml-auto flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200";

// ─── Completeness ─────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "?";
}

export default function VendorProfileForm({
  initialProfile,
  categories,
  initialMappings,
}: VendorProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(initialProfile.phoneNumber);
  const [businessName, setBusinessName] = useState(initialProfile.businessName);
  const [address, setAddress] = useState(initialProfile.address);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialMappings);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Completeness
  const fields = [fullName, phoneNumber, businessName, address];
  const filledCount = fields.filter((f) => f.trim().length > 0).length + (selectedCategories.length > 0 ? 1 : 0);
  const totalFields = 5;
  const completeness = Math.round((filledCount / totalFields) * 100);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (phoneNumber.trim().length < 10) throw new Error("Phone number must be at least 10 digits.");
      await saveVendorProfile({ fullName, phoneNumber, businessName, address });
      await updateVendorCategoryMappings(selectedCategories);
      showToast("Profile updated successfully.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = getInitials(businessName || fullName);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in-up">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-zinc-900 dark:text-white">Profile</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Manage your business details and service offerings.
        </p>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Identity Card ── */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          {/* Avatar + Completeness */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
              <span className="text-lg font-bold text-white font-heading">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Profile Completeness
                </span>
                <span className={`text-xs font-bold ${completeness === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`}>
                  {completeness}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    completeness === 100
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-purple-500 to-indigo-500"
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              {businessName && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 truncate">{businessName}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Business Details ── */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Business Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Name">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className={inputClass}
              />
            </Field>
            <Field label="Phone Number">
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Business Name">
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Sparkle Event Coordinators"
              className={inputClass}
            />
          </Field>

          <Field label="Service Area / Address">
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address or service coverage area"
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>

        {/* ── Category Offerings ── */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Category Offerings</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              You&apos;ll only receive lead requests that match your selected categories.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="py-6 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-500">No categories configured by admin yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20 scale-[1.02]"
                        : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                    title={cat.description || cat.name}
                  >
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
          {selectedCategories.length > 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"} selected
            </p>
          )}
        </div>

        {/* ── Save Action ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </form>

      {/* ── Account / Sign Out ── */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Account</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{initialProfile.email}</p>
          </div>
          {!showSignOutConfirm ? (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              type="button"
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-scale-in">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Are you sure?</span>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                type="button"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-red-500/20"
              >
                {signingOut ? "Signing out…" : "Yes, Sign Out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
