"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types";
import RoleSwitcher from "./RoleSwitcher";

interface AuthFormProps {
  mode: "login" | "register";
}

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
          // Catch unconfirmed email errors and customize output
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
        // Redirect will be handled by middleware or page reload
      } else {
        // Enforce validations
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

        // Display check-inbox notification for email verification
        setMessage(
          "Registration successful! A verification email has been sent. Please confirm your email in your inbox before logging in."
        );
        
        // Reset inputs
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
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl animate-fade-in">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl animate-fade-in">
          {message}
        </div>
      )}

      {mode === "register" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Account Type</label>
            <RoleSwitcher value={role} onChange={setRole} />
          </div>

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
              placeholder="John Doe"
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
              placeholder="9876543210"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
            />
          </div>

          {role === "vendor" && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="businessName" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Creative Studio Photography"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="address" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Business Address
                </label>
                <textarea
                  id="address"
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Creative Street, Studio Zone"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm resize-none"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@example.com"
          className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
        />
      </div>

      {mode === "register" && (
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition duration-200 shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.01] cursor-pointer text-sm"
      >
        {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}
