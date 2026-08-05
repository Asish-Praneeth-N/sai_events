import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  AlertCircle,
  Bell,
  BellRing,
  CheckCircle2,
  Clock3,
  Database,
  Radio,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

export default async function AdminNotificationsPage() {
  const supabase = await createClient();

  let notifications: any[] = [];
  let tableMissing = false;

  let dbError: Error | null = null;

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    notifications = data || [];
  } catch (err: any) {
    dbError = err;
  }

  /* ==========================================================================
     ERROR STATE
  ========================================================================== */

  if (dbError) {
    return (
      <div className="w-full animate-fade-in-up">
        <div className="relative overflow-hidden border border-red-500/25 bg-red-500/[0.04] p-4">
          <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-red-500" />

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-red-500/20 bg-red-500/[0.06] text-red-500">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0">
              <span className="block text-[7px] font-bold uppercase tracking-[0.18em] text-red-500">
                Notification Registry Unavailable
              </span>

              <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
                Failed to load system notifications:{" "}
                <span className="text-foreground">
                  {dbError.message}
                </span>
              </p>

              <div className="mt-3 flex items-start gap-2 border border-border bg-background/20 p-3">
                <Database className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />

                <p className="text-[7px] leading-4 text-muted-foreground">
                  Execute{" "}
                  <strong className="font-semibold text-foreground">
                    migration_milestone_2.sql
                  </strong>{" "}
                  in the Supabase SQL editor to create the required
                  notification tables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     METRICS
  ========================================================================== */

  const totalCount = notifications.length;

  const vendorCount = notifications.filter(
    (notification) =>
      notification.user_type === "vendor"
  ).length;

  const operationalManagerCount = notifications.filter(
    (notification) =>
      notification.user_type === "operational_manager"
  ).length;

  const adminCount = notifications.filter(
    (notification) =>
      notification.user_type === "admin"
  ).length;

  /* ==========================================================================
     BADGES
  ========================================================================== */

  const getRecipientBadge = (userType: string) => {
    switch (userType) {
      case "vendor":
        return (
          <span className="inline-flex items-center gap-1.5 border border-indigo-500/20 bg-indigo-500/[0.05] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-indigo-400">
            <UserRound className="h-2.5 w-2.5" />
            Vendor
          </span>
        );

      case "operational_manager":
        return (
          <span className="inline-flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/[0.05] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-emerald-500">
            <Users className="h-2.5 w-2.5" />
            OM
          </span>
        );

      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 border border-accent-gold/20 bg-accent-gold/[0.05] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-accent-gold">
            <ShieldCheck className="h-2.5 w-2.5" />
            Admin
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 border border-border bg-background/30 px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <UserRound className="h-2.5 w-2.5" />
            {userType || "User"}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (
      normalizedStatus === "sent" ||
      normalizedStatus === "delivered" ||
      normalizedStatus === "success"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/[0.05] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-emerald-500">
          <CheckCircle2 className="h-2.5 w-2.5" />
          {status}
        </span>
      );
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "queued"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/[0.05] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-amber-500">
          <Clock3 className="h-2.5 w-2.5" />
          {status}
        </span>
      );
    }

    if (
      normalizedStatus === "failed" ||
      normalizedStatus === "error"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 border border-red-500/20 bg-red-500/[0.04] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-red-400">
          <AlertCircle className="h-2.5 w-2.5" />
          {status}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 border border-border bg-background/30 px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        <Radio className="h-2.5 w-2.5" />
        {status || "Unknown"}
      </span>
    );
  };

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="w-full space-y-5 pb-10 animate-fade-in-up">
      {/* =====================================================================
          HEADER
      ===================================================================== */}

      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-3 w-3 text-accent-gold" />

              <span className="text-[7px] font-bold uppercase tracking-[0.24em] text-accent-gold">
                System Operations / Communications
              </span>
            </div>

            <h1
              className="text-3xl font-normal tracking-tight text-foreground sm:text-[34px]"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              System Notifications
            </h1>

            <p className="mt-1.5 max-w-2xl text-[9px] leading-5 text-muted-foreground">
              Monitor communication records dispatched across vendor,
              operational manager, admin, and customer workflows.
            </p>
          </div>

          {/* SYSTEM STATE */}

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-border bg-surface/30 px-3 py-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-25" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>

              <span className="text-[6px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Notification Log Active
              </span>
            </div>

            <div className="hidden h-8 w-8 items-center justify-center border border-accent-gold/15 bg-accent-gold/[0.03] text-accent-gold sm:flex">
              <BellRing className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          DATABASE WARNING
      ===================================================================== */}

      {tableMissing && (
        <div className="relative overflow-hidden border border-amber-500/25 bg-amber-500/[0.04] p-4">
          <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-amber-500" />

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-amber-500/20 bg-amber-500/[0.06] text-amber-500">
              <Database className="h-3.5 w-3.5" />
            </div>

            <div>
              <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-amber-500">
                Database Setup Required
              </span>

              <p className="mt-1 max-w-3xl text-[8px] leading-4 text-muted-foreground">
                The{" "}
                <code className="text-foreground">
                  notifications
                </code>{" "}
                table has not been created in your Supabase project.
                Execute{" "}
                <strong className="font-semibold text-foreground">
                  migration_milestone_2.sql
                </strong>{" "}
                to enable persistent real-time notification logs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          OPERATION METRICS
      ===================================================================== */}

      <section className="grid grid-cols-2 overflow-hidden border border-border bg-surface/30 lg:grid-cols-4">
        <MetricBlock
          number="01"
          label="Total Logs"
          value={totalCount}
          description="All notifications"
          icon={<Bell />}
        />

        <MetricBlock
          number="02"
          label="Vendor"
          value={vendorCount}
          description="Supplier communications"
          icon={<UserRound />}
          tone="indigo"
        />

        <MetricBlock
          number="03"
          label="Operations"
          value={operationalManagerCount}
          description="Manager communications"
          icon={<Users />}
          tone="emerald"
        />

        <MetricBlock
          number="04"
          label="Admin"
          value={adminCount}
          description="System administration"
          icon={<ShieldCheck />}
          tone="gold"
          last
        />
      </section>

      {/* =====================================================================
          NOTIFICATION REGISTRY
      ===================================================================== */}

      <section className="overflow-hidden border border-border bg-surface/25">
        {/* REGISTRY HEADER */}

        <div className="flex flex-col gap-3 border-b border-border bg-background/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-accent-gold/15 bg-accent-gold/[0.03] text-accent-gold">
              <BellRing className="h-3.5 w-3.5" />
            </div>

            <div>
              <span className="block text-[7px] font-bold uppercase tracking-[0.17em] text-foreground">
                Notification Logs
              </span>

              <span className="mt-0.5 block text-[6px] text-muted-foreground/50">
                System-generated communication history
              </span>
            </div>
          </div>

          <div className="flex h-7 items-center gap-2 border border-border bg-background/20 px-3">
            <Radio className="h-2.5 w-2.5 text-emerald-500" />

            <span className="font-mono text-[6px] text-muted-foreground">
              {String(totalCount).padStart(2, "0")} RECORDS
            </span>
          </div>
        </div>

        {/* REGISTRY META */}

        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
          <span className="text-[6px] font-bold uppercase tracking-[0.16em] text-muted-foreground/50">
            Communication Registry
          </span>

          <span className="font-mono text-[6px] text-muted-foreground/45">
            LATEST FIRST
          </span>
        </div>

        {/* ================================================================
            EMPTY STATE
        ================================================================= */}

        {notifications.length === 0 ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center border border-border bg-background/30 text-muted-foreground">
              <Bell className="h-4 w-4" />
            </div>

            <h3
              className="mt-4 text-base font-normal text-foreground"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              No notifications logged
            </h3>

            <p className="mt-1 max-w-[300px] text-[7px] leading-4 text-muted-foreground">
              System-generated communications will appear here as
              workflow notifications are dispatched.
            </p>
          </div>
        ) : (
          /* ==============================================================
             TABLE
          =============================================================== */

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[940px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-background/20">
                  <TableHeader>
                    Notification ID
                  </TableHeader>

                  <TableHeader>
                    Recipient Type
                  </TableHeader>

                  <TableHeader>
                    Recipient
                  </TableHeader>

                  <TableHeader>
                    Log Message
                  </TableHeader>

                  <TableHeader>
                    Dispatched
                  </TableHeader>

                  <TableHeader align="right">
                    Status
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className="
                      group
                      border-b border-border/50
                      transition-colors
                      last:border-b-0
                      hover:bg-accent-gold/[0.018]
                    "
                  >
                    {/* ID */}

                    <td className="px-4 py-4">
                      <span
                        className="block max-w-[120px] truncate font-mono text-[6px] text-muted-foreground/60"
                        title={notification.id}
                      >
                        {notification.id}
                      </span>
                    </td>

                    {/* RECIPIENT TYPE */}

                    <td className="px-4 py-4">
                      {getRecipientBadge(
                        notification.user_type
                      )}
                    </td>

                    {/* NAME */}

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-background/30 text-[7px] font-semibold uppercase text-muted-foreground transition-colors group-hover:border-accent-gold/20 group-hover:text-accent-gold">
                          {notification.user_name
                            ?.substring(0, 2)
                            .toUpperCase() || "NT"}
                        </div>

                        <span className="max-w-[160px] truncate text-[8px] font-semibold text-foreground">
                          {notification.user_name ||
                            "System Recipient"}
                        </span>
                      </div>
                    </td>

                    {/* MESSAGE */}

                    <td className="px-4 py-4">
                      <div
                        className="max-w-[310px]"
                        title={notification.message}
                      >
                        <p className="truncate text-[8px] leading-4 text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                    </td>

                    {/* TIME */}

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-3 w-3 shrink-0 text-muted-foreground/45" />

                        <span className="whitespace-nowrap font-mono text-[6px] text-muted-foreground">
                          {new Date(
                            notification.created_at
                          ).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-4 text-right">
                      {getStatusBadge(
                        notification.status
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* =============================================================================
   METRIC BLOCK
============================================================================= */

function MetricBlock({
  number,
  label,
  value,
  description,
  icon,
  tone = "gold",
  last = false,
}: {
  number: string;
  label: string;
  value: number;
  description: string;
  icon: React.ReactElement;
  tone?: "gold" | "indigo" | "emerald";
  last?: boolean;
}) {
  const tones = {
    gold: {
      text: "text-accent-gold",
      border: "border-accent-gold/15",
      bg: "bg-accent-gold/[0.03]",
    },

    indigo: {
      text: "text-indigo-400",
      border: "border-indigo-500/15",
      bg: "bg-indigo-500/[0.03]",
    },

    emerald: {
      text: "text-emerald-500",
      border: "border-emerald-500/15",
      bg: "bg-emerald-500/[0.03]",
    },
  };

  const style = tones[tone];

  return (
    <div
      className={`
        relative flex
        min-h-[96px]
        items-center gap-3

        border-b border-r border-border
        p-4

        even:border-r-0

        lg:border-b-0
        lg:even:border-r

        ${last ? "lg:border-r-0" : ""}
      `}
    >
      <span className="absolute right-3 top-2 font-mono text-[6px] text-muted-foreground/25">
        {number}
      </span>

      <div
        className={`
          flex h-8 w-8
          shrink-0 items-center
          justify-center border

          ${style.border}
          ${style.bg}
          ${style.text}

          [&>svg]:h-3.5
          [&>svg]:w-3.5
        `}
      >
        {icon}
      </div>

      <div>
        <span
          className={`
            block text-xl font-normal

            ${tone === "gold"
              ? "text-foreground"
              : style.text
            }
          `}
          style={{
            fontFamily: '"Playfair Display", serif',
          }}
        >
          {value}
        </span>

        <span className="mt-0.5 block text-[6px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>

        <span className="mt-0.5 block text-[6px] text-muted-foreground/45">
          {description}
        </span>
      </div>
    </div>
  );
}

/* =============================================================================
   TABLE HEADER
============================================================================= */

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`
        px-4 py-3
        text-[6px] font-bold
        uppercase tracking-[0.17em]
        text-muted-foreground/60

        ${align === "right"
          ? "text-right"
          : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
}