"use client";

import Link from "next/link";
import {
  Suspense,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types";
import RoleSwitcher from "./RoleSwitcher";

interface AuthFormProps {
  mode: "login" | "register";
}

const EASE = [0.16, 1, 0.3, 1] as const;

/* ========================================================================== */
/* INPUT SYSTEM                                                               */
/* ========================================================================== */

const fieldClass = `
  group
  relative
`;

const labelClass = `
  block
  mb-1

  text-[6.5px]
  font-bold
  uppercase
  tracking-[0.22em]

  text-[#a17a34]

  sm:text-[7px]

  dark:text-[#d2b56b]/75
`;

const inputClass = `
  w-full

  border-0
  border-b
  border-[#173d2c]/15

  bg-transparent

  px-0
  pb-2.5
  pt-1

  text-[12px]
  font-normal

  text-[#173d2c]

  outline-none

  placeholder:text-[#173d2c]/22

  transition-all
  duration-300

  focus:border-[#a17a34]

  sm:text-[13px]

  dark:border-white/[0.10]
  dark:text-[#eee5d7]
  dark:placeholder:text-white/18
  dark:focus:border-[#d2b56b]
`;

function AuthFormInner({
  mode,
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const shouldReduceMotion =
    useReducedMotion();

  const initialRole: UserRole =
    searchParams.get("role") === "vendor"
      ? "vendor"
      : "customer";

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [fullName, setFullName] =
    useState("");

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("");

  const [role, setRole] =
    useState<UserRole>(initialRole);

  const [
    businessName,
    setBusinessName,
  ] = useState("");

  const [address, setAddress] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  /* ======================================================================== */
  /* AUTHENTICATION LOGIC                                                     */
  /* ======================================================================== */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error: signInError } =
          await supabase.auth.signInWithPassword(
            {
              email,
              password,
            }
          );

        if (signInError) {
          if (
            signInError.message
              .toLowerCase()
              .includes("confirm") ||
            signInError.message
              .toLowerCase()
              .includes("verified")
          ) {
            throw new Error(
              "Please verify your email address before logging in. Check your inbox for the verification link."
            );
          }

          throw signInError;
        }

        const {
          data: { user: authedUser },
        } = await supabase.auth.getUser();

        if (authedUser) {
          const { data: profile } =
            await supabase
              .from("profiles")
              .select("role")
              .eq("id", authedUser.id)
              .single();

          const role = profile?.role;

          if (role === "admin") {
            router.push(
              "/admin/dashboard"
            );
          } else if (
            role === "vendor"
          ) {
            router.push("/vendor");
          } else if (
            role ===
            "operational_manager"
          ) {
            router.push("/operations");
          } else {
            router.push("/customer");
          }
        } else {
          router.refresh();
        }
      } else {
        if (
          password !== confirmPassword
        ) {
          throw new Error(
            "Passwords do not match."
          );
        }

        if (
          phoneNumber.length < 10
        ) {
          throw new Error(
            "Phone number must be at least 10 digits."
          );
        }

        const signupData: any = {
          full_name: fullName,
          phone_number: phoneNumber,
          role,
        };

        if (role === "vendor") {
          signupData.business_name =
            businessName;

          signupData.address =
            address;
        }

        const { error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,

            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: signupData,
            },
          });

        if (signUpError) {
          throw signUpError;
        }

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
      setError(
        err.message ||
        "An authentication error occurred."
      );

      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full"
      >
        {/* ============================================================ */}
        {/* ERROR                                                        */}
        {/* ============================================================ */}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden"
            >
              <div
                className="
                  mb-4
                  flex items-start
                  gap-2.5
                  border-l-2
                  border-red-500/55
                  bg-red-50/55
                  px-3 py-2.5
                  dark:bg-red-500/[0.06]
                "
              >
                <span
                  className="
                    mt-0.5
                    flex h-3.5 w-3.5
                    flex-shrink-0
                    items-center justify-center
                    rounded-full
                    border border-red-500/35
                    text-[7px] font-bold
                    text-red-700
                    dark:text-red-400
                  "
                >
                  !
                </span>

                <span
                  className="
                    text-[9px]
                    font-medium
                    leading-[1.55]
                    text-red-700
                    dark:text-red-400
                  "
                >
                  {error}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* REGISTRATION                                                 */}
        {/* ============================================================ */}

        {mode === "register" && (
          <>
            {/* Role */}

            <div className="mb-5">
              <div
                className="
                  mb-2
                  flex items-center
                  justify-between
                  gap-4
                "
              >
                <label className={labelClass}>
                  I am joining as
                </label>

                <span
                  className="
                    text-[5.5px] font-semibold uppercase
                    tracking-[0.2em]
                    text-[#173d2c]/22
                    dark:text-white/18
                  "
                >
                  Select account type
                </span>
              </div>

              <RoleSwitcher
                value={role}
                onChange={setRole}
              />
            </div>

            {/* -------------------------------------------------------- */}
            {/* COMPACT IDENTITY GRID                                    */}
            {/* -------------------------------------------------------- */}

            <div
              className="
                grid
                grid-cols-1
                gap-x-7
                gap-y-4

                sm:grid-cols-2
              "
            >
              <div className={fieldClass}>
                <label
                  htmlFor="fullName"
                  className={labelClass}
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) =>
                    setFullName(
                      e.target.value
                    )
                  }
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>

              <div className={fieldClass}>
                <label
                  htmlFor="phoneNumber"
                  className={labelClass}
                >
                  Phone Number
                </label>

                <input
                  id="phoneNumber"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value
                    )
                  }
                  placeholder="9876543210"
                  className={inputClass}
                />
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* VENDOR EXPANSION                                         */}
            {/* -------------------------------------------------------- */}

            <AnimatePresence
              initial={false}
              mode="wait"
            >
              {role === "vendor" && (
                <motion.div
                  key="vendor-fields"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y:
                      shouldReduceMotion
                        ? 0
                        : -5,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  transition={{
                    duration:
                      shouldReduceMotion
                        ? 0.15
                        : 0.4,
                    ease: EASE,
                  }}
                  className="overflow-hidden"
                >
                  <div
                    className="
                      mt-5
                      border-t
                      border-[#173d2c]/10
                      pt-4
                      dark:border-white/[0.07]
                    "
                  >
                    <div
                      className="
                        mb-4
                        flex items-center gap-3
                      "
                    >
                      <span className="h-1 w-1 rotate-45 bg-[#a17a34]/70" />

                      <span
                        className="
                          text-[6px] font-bold uppercase
                          tracking-[0.23em]
                          text-[#173d2c]/35
                          dark:text-white/25
                        "
                      >
                        Business Profile
                      </span>

                      <span className="h-px flex-1 bg-[#173d2c]/10 dark:bg-white/[0.07]" />
                    </div>

                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-x-7
                        gap-y-4
                        sm:grid-cols-2
                      "
                    >
                      <div className={fieldClass}>
                        <label
                          htmlFor="businessName"
                          className={labelClass}
                        >
                          Business Name
                        </label>

                        <input
                          id="businessName"
                          type="text"
                          required
                          value={
                            businessName
                          }
                          onChange={(e) =>
                            setBusinessName(
                              e.target.value
                            )
                          }
                          placeholder="Creative Studio"
                          className={
                            inputClass
                          }
                        />
                      </div>

                      <div className={fieldClass}>
                        <label
                          htmlFor="address"
                          className={labelClass}
                        >
                          Business Address
                        </label>

                        <textarea
                          id="address"
                          required
                          rows={1}
                          value={address}
                          onChange={(e) =>
                            setAddress(
                              e.target.value
                            )
                          }
                          placeholder="Business location"
                          className={`
                            ${inputClass}
                            min-h-[34px]
                            resize-none
                          `}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Credentials heading */}

            <div
              className="
                mb-4 mt-5
                flex items-center gap-3
              "
            >
              <span
                className="
                  text-[6px] font-bold uppercase
                  tracking-[0.23em]
                  text-[#a17a34]
                  dark:text-[#d2b56b]
                "
              >
                Secure Credentials
              </span>

              <span className="h-px flex-1 bg-[#173d2c]/10 dark:bg-white/[0.07]" />
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* CREDENTIAL GRID                                              */}
        {/* ============================================================ */}

        <div
          className={`
            grid grid-cols-1
            gap-x-7 gap-y-4

            ${mode === "register"
              ? "sm:grid-cols-2"
              : ""
            }
          `}
        >
          {/* Email */}

          <div className={fieldClass}>
            <label
              htmlFor="email"
              className={labelClass}
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="yourname@example.com"
              className={inputClass}
            />
          </div>

          {/* Password */}

          <div className={fieldClass}>
            <div
              className="
                flex items-center
                justify-between
                gap-3
              "
            >
              <label
                htmlFor="password"
                className={labelClass}
              >
                Password
              </label>

              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="
                    mb-1
                    text-[9px] font-bold uppercase
                    tracking-[0.16em]
                    text-[#173d2c]/32
                    transition-colors
                    hover:text-[#a17a34]
                    dark:text-white/25
                    dark:hover:text-[#d2b56b]
                  "
                >
                  Forgot?
                </Link>
              )}
            </div>

            <div className="relative">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="••••••••"
                className={`${inputClass} pr-9`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="
                  absolute
                  bottom-1.5 right-0
                  flex h-7 w-7
                  items-center justify-center
                  text-[#173d2c]/28
                  transition-colors
                  hover:text-[#a17a34]
                  dark:text-white/25
                  dark:hover:text-[#d2b56b]
                "
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}

          {mode === "register" && (
            <div
              className={`
                ${fieldClass}
                sm:col-span-2
              `}
            >
              <label
                htmlFor="confirmPassword"
                className={labelClass}
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  required
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  className={`${inputClass} pr-9`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    absolute
                    bottom-1.5 right-0
                    flex h-7 w-7
                    items-center justify-center
                    text-[#173d2c]/28
                    transition-colors
                    hover:text-[#a17a34]
                    dark:text-white/25
                    dark:hover:text-[#d2b56b]
                  "
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* ACTION                                                       */}
        {/* ============================================================ */}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                y: -2,
              }
          }
          whileTap={
            shouldReduceMotion
              ? undefined
              : {
                scale: 0.99,
              }
          }
          className="
            group
            relative
            mt-5

            flex w-full
            items-center
            justify-between

            overflow-hidden

            bg-[#143d2b]

            px-5 py-3.5

            text-[#fffaf1]

            shadow-[0_9px_24px_rgba(20,61,43,0.13)]

            transition-all
            duration-500

            cursor-pointer

            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:bg-[#d2b56b]
            dark:text-[#161812]
          "
        >
          {/* moving highlight */}

          <span
            aria-hidden="true"
            className="
              absolute inset-y-0
              -left-[55%]
              w-[38%]
              skew-x-[-20deg]

              bg-gradient-to-r
              from-transparent
              via-white/15
              to-transparent

              transition-[left]
              duration-700

              group-hover:left-[120%]
            "
          />

          <span
            className="
              relative z-10
              flex items-center gap-3
            "
          >
            <span
              className="
                h-1.5 w-1.5
                rotate-45
                bg-[#d2b56b]
                dark:bg-[#173d2c]
              "
            />

            <span
              className="
                text-[7.5px] font-bold uppercase
                tracking-[0.23em]
              "
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create My Account"}
            </span>
          </span>

          <ArrowRight
            className="
              relative z-10
              h-3.5 w-3.5
              transition-transform duration-500
              group-hover:translate-x-1
            "
          />
        </motion.button>

        {/* Security */}

        <div
          className="
            mt-3
            flex items-center
            justify-center
            gap-2
          "
        >
          <LockKeyhole
            className="
              h-2 w-2
              text-[#a17a34]/45
              dark:text-[#d2b56b]/40
            "
          />

          <span
            className="
              text-[5.5px] font-semibold uppercase
              tracking-[0.2em]
              text-[#173d2c]/22
              dark:text-white/18
            "
          >
            Protected SAI Events access
          </span>
        </div>
      </form>

      {/* ================================================================ */}
      {/* SUCCESS EXPERIENCE                                               */}
      {/* ================================================================ */}

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed inset-0 z-[99999]
              flex items-center justify-center
              bg-[#0b1710]/88
              p-4
              backdrop-blur-md
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                scale:
                  shouldReduceMotion
                    ? 1
                    : 0.95,
                y:
                  shouldReduceMotion
                    ? 0
                    : 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
              }}
              transition={{
                duration:
                  shouldReduceMotion
                    ? 0.2
                    : 0.6,
                ease: EASE,
              }}
              className="
                relative
                w-full max-w-[480px]
                overflow-hidden
                border border-[#173d2c]/10
                bg-[#f7f0e6]
                p-6
                shadow-[0_30px_100px_rgba(0,0,0,0.32)]
                sm:p-8

                dark:border-white/[0.08]
                dark:bg-[#191b17]
              "
            >
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute -right-4 -top-3
                  select-none
                  font-heading
                  text-[8rem] italic
                  leading-none
                  tracking-[-0.09em]
                  text-[#173d2c]/[0.025]
                  dark:text-white/[0.018]
                "
                style={{
                  fontFamily:
                    '"Playfair Display", serif',
                }}
              >
                SAI
              </span>

              <div
                className="
                  relative z-10
                  mb-6
                  flex items-center gap-3
                "
              >
                <span className="h-px w-8 bg-[#173d2c]/30 dark:bg-[#d2b56b]/40" />

                <span
                  className="
                    text-[6.5px] font-bold uppercase
                    tracking-[0.27em]
                    text-[#a17a34]
                    dark:text-[#d2b56b]
                  "
                >
                  Registration Complete
                </span>
              </div>

              <div
                className="
                  relative z-10
                  mb-5
                  flex h-12 w-12
                  items-center justify-center
                  rounded-full
                  border border-[#173d2c]/15
                  dark:border-white/10
                "
              >
                <Check className="h-4 w-4 text-[#a17a34] dark:text-[#d2b56b]" />
              </div>

              <h3
                className="
                  relative z-10
                  font-heading
                  text-[clamp(2.2rem,8vw,3.3rem)]
                  font-normal
                  leading-[0.9]
                  tracking-[-0.045em]
                  text-[#173d2c]
                  dark:text-[#f0e8db]
                "
                style={{
                  fontFamily:
                    '"Playfair Display", serif',
                }}
              >
                Your journey
                <br />

                <span className="italic text-[#9a742e] dark:text-[#d2b56b]">
                  begins.
                </span>
              </h3>

              <p
                className="
                  relative z-10
                  mt-4
                  max-w-[390px]
                  text-[10px]
                  leading-[1.75]
                  text-[#173d2c]/50
                  dark:text-[#eee5d7]/45
                "
              >
                {message}
              </p>

              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  router.push("/login");
                }}
                className="
                  group
                  relative z-10
                  mt-6
                  flex w-full
                  items-center justify-between
                  bg-[#143d2b]
                  px-5 py-3.5
                  text-[#fffaf1]
                  cursor-pointer
                  dark:bg-[#d2b56b]
                  dark:text-[#161812]
                "
              >
                <span
                  className="
                    text-[7px] font-bold uppercase
                    tracking-[0.22em]
                  "
                >
                  Continue to Sign In
                </span>

                <ArrowRight
                  className="
                    h-3.5 w-3.5
                    transition-transform duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* LOGIN TRANSITION                                                 */}
      {/* ================================================================ */}

      <AnimatePresence>
        {loading &&
          mode === "login" && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                fixed inset-0 z-[99999]
                flex flex-col
                items-center justify-center
                overflow-hidden
                bg-[#11130f]/96
                px-6
                backdrop-blur-md
              "
            >
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  select-none
                  font-heading
                  text-[clamp(9rem,30vw,24rem)]
                  italic
                  leading-none
                  tracking-[-0.09em]
                  text-white/[0.018]
                "
                style={{
                  fontFamily:
                    '"Playfair Display", serif',
                }}
              >
                SAI
              </span>

              <div
                className="
                  relative
                  flex h-24 w-24
                  items-center justify-center
                  rounded-full
                  border border-white/10
                "
              >
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                        rotate: 360,
                      }
                  }
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                    absolute inset-[7px]
                    rounded-full
                    border border-dashed
                    border-[#d2b56b]/40
                  "
                />

                <Sparkles className="h-5 w-5 text-[#d2b56b]" />
              </div>

              <p
                className="
                  relative z-10
                  mt-6
                  text-[7px] font-bold uppercase
                  tracking-[0.3em]
                  text-[#d2b56b]
                "
              >
                Preparing your experience
              </p>
            </motion.div>
          )}
      </AnimatePresence>
    </>
  );
}

/* ========================================================================== */
/* EXPORT                                                                     */
/* ========================================================================== */

export default function AuthForm({
  mode,
}: AuthFormProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-8">
          <div
            className="
              h-6 w-6
              animate-spin
              rounded-full
              border border-[#173d2c]/10
              border-t-[#a17a34]
              dark:border-white/10
              dark:border-t-[#d2b56b]
            "
          />
        </div>
      }
    >
      <AuthFormInner mode={mode} />
    </Suspense>
  );
}