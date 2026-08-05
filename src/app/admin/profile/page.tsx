
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  ShieldAlert,
  Bell,
  Palette,
  History,
  CheckCircle2,
  KeyRound,
  Fingerprint,
  Activity,
  Clock3,
  CircleUserRound,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/unauthorized");
  }

  // Mock activity history list for premium dashboard feel
  const mockActivity = [
    {
      action: "Vendor Account Approved",
      details: "Approved Elara Decor Co. mapping",
      time: "2 hours ago",
    },
    {
      action: "Request Status Updated",
      details: "Marked Wedding Stage booking as Confirmed",
      time: "1 day ago",
    },
    {
      action: "Category Created",
      details: "Added Stage Setup under corporate catalog",
      time: "3 days ago",
    },
    {
      action: "Security Login Verification",
      details: "Session started from Hyderabad, IN",
      time: "4 days ago",
    },
  ];

  const initials = profile.full_name
    ? profile.full_name.substring(0, 2)
    : "AD";

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ================================================================
          PAGE HEADER
      ================================================================ */}

      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px w-5 bg-accent-gold" />

              <span className="text-[7px] font-bold uppercase tracking-[0.24em] text-accent-gold">
                Administration / Identity
              </span>
            </div>

            <h1
              className="text-3xl font-normal tracking-tight text-foreground sm:text-[34px]"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Account Profile
            </h1>

            <p className="mt-1.5 max-w-xl text-[10px] leading-5 text-muted-foreground">
              Administrator identity, platform access, security posture and
              account preferences.
            </p>
          </div>

          {/* Account State */}

          <div className="flex items-center gap-2 self-start border border-emerald-500/15 bg-emerald-500/[0.035] px-3 py-2 sm:self-auto">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>

            <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-emerald-500">
              Administrator Active
            </span>
          </div>
        </div>
      </header>

      {/* ================================================================
          IDENTITY STRIP
      ================================================================ */}

      <section className="relative overflow-hidden border border-border bg-surface/50">
        <div className="absolute left-0 top-0 h-full w-[2px] bg-accent-gold" />

        <div className="flex flex-col lg:flex-row">
          {/* Main Identity */}

          <div className="flex flex-1 items-center gap-5 p-5 sm:p-6">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center border border-accent-gold/30 bg-accent-gold/[0.045] text-lg font-semibold uppercase tracking-[0.08em] text-accent-gold sm:h-[72px] sm:w-[72px]">
                {initials}
              </div>

              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center border-2 border-surface bg-emerald-500 text-white">
                <CheckCircle2 className="h-2.5 w-2.5" />
              </span>
            </div>

            <div className="min-w-0">
              <span className="mb-1 block text-[6px] font-bold uppercase tracking-[0.22em] text-muted-foreground/50">
                Platform Identity
              </span>

              <h2
                className="truncate text-xl font-normal text-foreground sm:text-2xl"
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                {profile.full_name || "Administrator"}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-[0.16em] text-accent-gold">
                  <Shield className="h-3 w-3" />
                  Master Controller
                </span>

                <span className="hidden h-3 w-px bg-border sm:block" />

                <span className="truncate text-[8px] text-muted-foreground">
                  {profile.email}
                </span>
              </div>
            </div>
          </div>

          {/* Access Metrics */}

          <div className="grid grid-cols-2 border-t border-border lg:w-[410px] lg:border-l lg:border-t-0">
            <IdentityMetric
              icon={<Shield />}
              eyebrow="Authorization"
              label="Full Platform Access"
            />

            <IdentityMetric
              icon={<Calendar />}
              eyebrow="Account Since"
              label={formatDate(profile.created_at)}
              last
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          MAIN PROFILE LAYOUT
      ================================================================ */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* ==============================================================
            LEFT / PRIMARY INFORMATION
        ============================================================== */}

        <div className="space-y-6">
          {/* ACCOUNT INFORMATION */}

          <section className="border border-border bg-surface/40">
            <SectionHeader
              icon={<CircleUserRound />}
              eyebrow="Identity Registry"
              title="General Parameters"
              description="Core administrator account information registered with the platform."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <ProfileField
                icon={<User />}
                label="Full Name"
                value={profile.full_name || "Administrator"}
              />

              <ProfileField
                icon={<Mail />}
                label="Email Account"
                value={profile.email || "N/A"}
                mono
                right
              />

              <ProfileField
                icon={<Phone />}
                label="Contact Phone"
                value={profile.phone_number || "N/A"}
                bottom
              />

              <ProfileField
                icon={<Shield />}
                label="Account Role"
                value={profile.role || "admin"}
                accent
                right
                bottom
              />
            </div>
          </section>

          {/* PREFERENCES */}

          <section className="border border-border bg-surface/40">
            <SectionHeader
              icon={<Palette />}
              eyebrow="Environment"
              title="Preferences"
              description="Current communication and interface configuration."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <PreferenceItem
                icon={<Bell />}
                title="Email Notifications"
                description="Administrative alerts and operational updates"
                status="Active"
                state="success"
              />

              <PreferenceItem
                icon={<Palette />}
                title="Theme Selection"
                description="Interface appearance follows your selected theme"
                status="Adaptive"
                state="accent"
                right
              />
            </div>
          </section>

          {/* ACTIVITY */}

          <section className="border border-border bg-surface/40">
            <SectionHeader
              icon={<History />}
              eyebrow="Audit Intelligence"
              title="Recent Activity Log"
              description="Latest administrative actions associated with this account."
            />

            <div>
              {mockActivity.map((activity, index) => (
                <ActivityRow
                  key={index}
                  index={index + 1}
                  action={activity.action}
                  details={activity.details}
                  time={activity.time}
                  last={index === mockActivity.length - 1}
                />
              ))}
            </div>
          </section>
        </div>

        {/* ==============================================================
            RIGHT / SECURITY PANEL
        ============================================================== */}

        <aside className="space-y-6">
          {/* ACCESS STATUS */}

          <section className="border border-border bg-surface/40">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-accent-gold" />

                <span className="text-[7px] font-bold uppercase tracking-[0.22em] text-accent-gold">
                  Access Status
                </span>
              </div>

              <h3
                className="mt-3 text-lg font-normal text-foreground"
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Administrator Session
              </h3>

              <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
                Your account currently has unrestricted administrative access
                across SAI Events operations.
              </p>
            </div>

            <div className="divide-y divide-border/60">
              <SecurityRow
                label="Account Role"
                value={profile.role || "admin"}
                accent
              />

              <SecurityRow
                label="Access Level"
                value="Full Access"
                success
              />

              <SecurityRow
                label="Account State"
                value="Verified"
                success
              />
            </div>
          </section>

          {/* MULTI-FACTOR SECURITY */}

          <section className="relative overflow-hidden border border-border bg-surface/40">
            <div className="absolute left-0 top-0 h-full w-[2px] bg-amber-500/70" />

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-amber-500/20 bg-amber-500/[0.04] text-amber-500">
                  <ShieldAlert className="h-4 w-4" />
                </div>

                <span className="border border-border bg-background/30 px-2 py-1 text-[6px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Disabled
                </span>
              </div>

              <div className="mt-5">
                <span className="text-[6px] font-bold uppercase tracking-[0.22em] text-amber-500">
                  Security Control
                </span>

                <h3
                  className="mt-1.5 text-lg font-normal text-foreground"
                  style={{
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  Multi-Factor Authentication
                </h3>

                <p className="mt-2 text-[8px] leading-[1.7] text-muted-foreground">
                  Add an extra layer of protection to your platform operations
                  account by requiring an authenticator code.
                </p>
              </div>

              <div className="mt-5 border-t border-border/60 pt-4">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-3.5 w-3.5 text-muted-foreground" />

                  <div>
                    <span className="block text-[8px] font-semibold text-foreground">
                      2FA Protection
                    </span>

                    <span className="mt-0.5 block text-[7px] text-muted-foreground">
                      Additional verification inactive
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECURITY INFORMATION */}

          <section className="border border-border bg-surface/40">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-accent-gold" />

                <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Security Summary
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-gold" />

                <div>
                  <span className="block text-[8px] font-semibold text-foreground">
                    Full Platform Access
                  </span>

                  <span className="mt-1 block text-[7px] leading-4 text-muted-foreground">
                    Administrative authorization is enabled for this account.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-gold" />

                <div>
                  <span className="block text-[8px] font-semibold text-foreground">
                    Account Registration
                  </span>

                  <span className="mt-1 block text-[7px] leading-4 text-muted-foreground">
                    {formatDate(profile.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================================
   SECTION HEADER
============================================================================ */

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactElement;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border px-5 py-4 sm:px-6">
      <div
        className="
          mt-0.5 flex h-8 w-8 shrink-0
          items-center justify-center

          border border-accent-gold/20
          bg-accent-gold/[0.035]
          text-accent-gold

          [&>svg]:h-3.5
          [&>svg]:w-3.5
        "
      >
        {icon}
      </div>

      <div>
        <span className="block text-[6px] font-bold uppercase tracking-[0.22em] text-accent-gold">
          {eyebrow}
        </span>

        <h3 className="mt-1 text-[11px] font-semibold text-foreground">
          {title}
        </h3>

        <p className="mt-0.5 text-[7px] leading-4 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
   PROFILE FIELD
============================================================================ */

function ProfileField({
  icon,
  label,
  value,
  mono = false,
  accent = false,
  right = false,
  bottom = false,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
  right?: boolean;
  bottom?: boolean;
}) {
  return (
    <div
      className={`
        relative p-5 sm:p-6

        border-b border-border/60

        ${right ? "sm:border-l" : ""}
        ${bottom ? "sm:border-b-0" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <span
          className="
            text-muted-foreground
            [&>svg]:h-3
            [&>svg]:w-3
          "
        >
          {icon}
        </span>

        <span className="text-[6px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
          {label}
        </span>
      </div>

      <div
        className={`
          mt-3 break-words
          text-[10px] font-semibold

          ${accent
            ? "uppercase tracking-[0.08em] text-accent-gold"
            : "text-foreground"
          }

          ${mono ? "font-mono" : ""}
        `}
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================================
   IDENTITY METRIC
============================================================================ */

function IdentityMetric({
  icon,
  eyebrow,
  label,
  last = false,
}: {
  icon: React.ReactElement;
  eyebrow: string;
  label: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        flex min-h-[92px]
        items-center gap-3
        p-4

        ${!last ? "border-r border-border" : ""}
      `}
    >
      <span
        className="
          text-accent-gold
          [&>svg]:h-3.5
          [&>svg]:w-3.5
        "
      >
        {icon}
      </span>

      <div className="min-w-0">
        <span className="block text-[6px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
          {eyebrow}
        </span>

        <span className="mt-1 block text-[8px] font-semibold leading-4 text-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ============================================================================
   PREFERENCE ITEM
============================================================================ */

function PreferenceItem({
  icon,
  title,
  description,
  status,
  state,
  right = false,
}: {
  icon: React.ReactElement;
  title: string;
  description: string;
  status: string;
  state: "success" | "accent";
  right?: boolean;
}) {
  return (
    <div
      className={`
        flex items-center justify-between
        gap-4 p-5 sm:p-6

        border-b border-border/60
        sm:border-b-0

        ${right ? "sm:border-l" : ""}
      `}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="
            mt-0.5 shrink-0
            text-accent-gold

            [&>svg]:h-3.5
            [&>svg]:w-3.5
          "
        >
          {icon}
        </span>

        <div className="min-w-0">
          <span className="block text-[9px] font-semibold text-foreground">
            {title}
          </span>

          <span className="mt-1 block text-[7px] leading-4 text-muted-foreground">
            {description}
          </span>
        </div>
      </div>

      <span
        className={`
          shrink-0 border
          px-2 py-1

          text-[6px] font-bold
          uppercase tracking-[0.14em]

          ${state === "success"
            ? `
                border-emerald-500/15
                bg-emerald-500/[0.04]
                text-emerald-500
              `
            : `
                border-accent-gold/15
                bg-accent-gold/[0.04]
                text-accent-gold
              `
          }
        `}
      >
        {status}
      </span>
    </div>
  );
}

/* ============================================================================
   ACTIVITY ROW
============================================================================ */

function ActivityRow({
  index,
  action,
  details,
  time,
  last,
}: {
  index: number;
  action: string;
  details: string;
  time: string;
  last: boolean;
}) {
  return (
    <div
      className={`
        group flex items-start
        gap-4 px-5 py-4
        transition-colors

        hover:bg-accent-gold/[0.012]

        sm:px-6

        ${!last ? "border-b border-border/60" : ""}
      `}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-background/30 font-mono text-[7px] text-muted-foreground transition-colors group-hover:border-accent-gold/20 group-hover:text-accent-gold">
        {String(index).padStart(2, "0")}
      </div>

      <div className="min-w-0 flex-1">
        <span className="block text-[9px] font-semibold text-foreground">
          {action}
        </span>

        <span className="mt-1 block text-[7px] leading-4 text-muted-foreground">
          {details}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
        <Clock3 className="h-2.5 w-2.5 text-muted-foreground/40" />

        <span className="whitespace-nowrap text-[7px] text-muted-foreground">
          {time}
        </span>
      </div>
    </div>
  );
}

/* ============================================================================
   SECURITY ROW
============================================================================ */

function SecurityRow({
  label,
  value,
  accent = false,
  success = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <span className="text-[7px] font-medium text-muted-foreground">
        {label}
      </span>

      <span
        className={`
          text-[6px] font-bold
          uppercase tracking-[0.14em]

          ${success
            ? "text-emerald-500"
            : accent
              ? "text-accent-gold"
              : "text-foreground"
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}
