"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types";
import RoleSwitcher from "./RoleSwitcher";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
}

const inputClass =
  "w-full px-4 py-3 bg-[#130f0c]/60 border border-white/8 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/45 focus:border-[#D4AF37]/70 text-[#F7F3EC] placeholder-white/20 transition-all duration-300 text-sm font-light";

const labelClass =
  "text-[9px] font-bold text-[#D4AF37]/80 uppercase tracking-[0.2em]";

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (
            signInError.message.toLowerCase().includes("confirm") ||
            signInError.message.toLowerCase().includes("verified")
          ) {
            throw new Error(
              "Please verify your email address before logging in. Check your inbox for the verification link."
            );
          }
          throw signInError;
        }

        router.refresh();
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (phoneNumber.length < 10) {
          throw new Error("Phone number must be at least 10 digits.");
        }

        const signupData: any = {
          full_name: fullName,
          phone_number: phoneNumber,
          role,
        };

        if (role === "vendor") {
          signupData.business_name = businessName;
          signupData.address = address;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: signupData,
          },
        });

        if (signUpError) throw signUpError;

        setMessage(
          "Registration successful! A verification email has been sent. Please confirm your email in your inbox before logging in."
        );

        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setPhoneNumber("");
        setBusinessName("");
        setAddress("");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#f5db91] text-xs font-semibold rounded-xl leading-relaxed">
          {message}
        </div>
      )}

      {mode === "register" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Account Type</label>
            <RoleSwitcher value={role} onChange={setRole} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fullName" className={labelClass}>
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" className={labelClass}>
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="9876543210"
              className={inputClass}
            />
          </div>

          {role === "vendor" && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="businessName" className={labelClass}>
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Creative Studio Photography"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="address" className={labelClass}>
                  Business Address
                </label>
                <textarea
                  id="address"
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Creative Street, Studio Zone"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@example.com"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mode === "register" && (
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] hover:from-[#c9a42e] hover:to-[#d9b43e] disabled:opacity-50 text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-[#D4AF37]/15 hover:shadow-[#D4AF37]/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs uppercase tracking-[0.18em]"
      >
        {loading
          ? "Please wait..."
          : mode === "login"
          ? "Sign In"
          : "Create Account"}
      </button>
    </form>
  );
}
