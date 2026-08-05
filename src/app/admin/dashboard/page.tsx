
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock,
  GitBranch,
  HelpCircle,
  MapPin,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Store,
  TrendingUp,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

/* ============================================================================
   ADMIN OPERATIONS CONTROL CENTER
============================================================================ */

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const todayStr = new Date().toISOString().split("T")[0];

  let dbError: Error | null = null;

  let todaysEvents = 0;
  let pendingEventCases = 0;
  let pendingVendors = 0;
  let pendingVendorInvitations = 0;
  let newGuestEnquiries = 0;
  let availableOMs = 0;
  let waitingOMAssignment = 0;
  let activeEvents = 0;
  let delayedEvents = 0;
  let escalatedEvents = 0;

  let recentAuditLogs: any[] = [];
  let recentNotifications: any[] = [];
  let upcomingEvents: any[] = [];

  try {
    /* ------------------------------------------------------------------------
       NEW GUEST ENQUIRIES
    ------------------------------------------------------------------------ */

    try {
      const { count: newEnquiriesCount } = await supabase
        .from("guest_enquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");

      newGuestEnquiries = newEnquiriesCount || 0;
    } catch (_) {}

    /* ------------------------------------------------------------------------
       TODAY'S EVENTS
    ------------------------------------------------------------------------ */

    const { count: todaysEventsCount, error: err1 } = await supabase
      .from("event_requests")
      .select("id", { count: "exact", head: true })
      .eq("event_date", todayStr);

    if (err1) throw err1;

    todaysEvents = todaysEventsCount || 0;

    /* ------------------------------------------------------------------------
       PENDING EVENT CASES
    ------------------------------------------------------------------------ */

    const { count: pendingEventCasesCount, error: err2 } =
      await supabase
        .from("event_requests")
        .select("id", { count: "exact", head: true })
        .in("status", [
          "Request Submitted",
          "Under Admin Review",
        ]);

    if (err2) throw err2;

    pendingEventCases = pendingEventCasesCount || 0;

    /* ------------------------------------------------------------------------
       PENDING VENDORS
    ------------------------------------------------------------------------ */

    const { count: pendingVendorsCount, error: err3 } =
      await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "vendor")
        .eq("status", "Pending");

    if (err3) throw err3;

    pendingVendors = pendingVendorsCount || 0;

    /* ------------------------------------------------------------------------
       PENDING VENDOR INVITATIONS
    ------------------------------------------------------------------------ */

    const {
      count: pendingVendorInvitationsCount,
      error: err4,
    } = await supabase
      .from("vendor_assignments")
      .select("id", { count: "exact", head: true })
      .eq("status", "Pending");

    if (err4) throw err4;

    pendingVendorInvitations =
      pendingVendorInvitationsCount || 0;

    /* ------------------------------------------------------------------------
       AVAILABLE OPERATIONAL MANAGERS
    ------------------------------------------------------------------------ */

    const { count: availableOMCount, error: omError } =
      await supabase
        .from("operational_managers")
        .select("id", { count: "exact", head: true })
        .eq("availability_status", "Available")
        .eq("employment_status", "Active");

    if (omError) throw omError;

    availableOMs = availableOMCount || 0;

    /* ------------------------------------------------------------------------
       WAITING FOR OM ASSIGNMENT
    ------------------------------------------------------------------------ */

    const { count: waitingOMCount, error: err6 } =
      await supabase
        .from("event_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "Ready For Execution");

    if (err6) throw err6;

    waitingOMAssignment = waitingOMCount || 0;

    /* ------------------------------------------------------------------------
       ACTIVE EVENTS
    ------------------------------------------------------------------------ */

    const { count: activeCount, error: err7 } =
      await supabase
        .from("event_requests")
        .select("id", { count: "exact", head: true })
        .in("status", [
          "Operational Manager Assigned",
          "Preparation",
          "Execution",
        ]);

    if (err7) throw err7;

    activeEvents = activeCount || 0;

    /* ------------------------------------------------------------------------
       DELAYED EVENTS
    ------------------------------------------------------------------------ */

    const { count: delayedCount, error: err8 } =
      await supabase
        .from("event_assignments")
        .select("id", { count: "exact", head: true })
        .lt(
          "expected_completion",
          new Date().toISOString()
        )
        .neq("status", "Closed");

    if (err8) throw err8;

    delayedEvents = delayedCount || 0;

    /* ------------------------------------------------------------------------
       ESCALATED EVENTS
    ------------------------------------------------------------------------ */

    const { count: escalatedCount, error: err9 } =
      await supabase
        .from("event_assignments")
        .select("id", { count: "exact", head: true })
        .gt("escalation_level", 0);

    if (err9) throw err9;

    escalatedEvents = escalatedCount || 0;

    /* ------------------------------------------------------------------------
       AUDIT LOGS
    ------------------------------------------------------------------------ */

    const { data: auditData, error: err10 } =
      await supabase
        .from("audit_logs")
        .select(
          "id, action, created_at, profiles ( full_name )"
        )
        .order("created_at", { ascending: false })
        .limit(5);

    if (err10) throw err10;

    recentAuditLogs = auditData || [];

    /* ------------------------------------------------------------------------
       NOTIFICATIONS
    ------------------------------------------------------------------------ */

    const {
      data: notificationData,
      error: err11,
    } = await supabase
      .from("notifications")
      .select("id, message, created_at, user_name")
      .order("created_at", { ascending: false })
      .limit(5);

    if (err11) throw err11;

    recentNotifications = notificationData || [];

    /* ------------------------------------------------------------------------
       UPCOMING EVENTS
    ------------------------------------------------------------------------ */

    const {
      data: upcomingEventsData,
      error: err12,
    } = await supabase
      .from("event_requests")
      .select(`
        id,
        event_type,
        event_date,
        location,
        status,
        total_budget,
        profiles ( full_name )
      `)
      .order("event_date", { ascending: true })
      .limit(4);

    if (err12) throw err12;

    upcomingEvents = upcomingEventsData || [];
  } catch (err: any) {
    dbError = err;
  }

  /* ==========================================================================
     ERROR STATE
  ========================================================================== */

  if (dbError) {
    return (
      <section
        className="
          relative overflow-hidden
          border border-red-500/20
          bg-red-500/[0.04]
          p-5 sm:p-6
        "
      >
        <span className="absolute left-0 top-0 h-full w-[2px] bg-red-500" />

        <div className="flex items-start gap-4">
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              border border-red-500/20
              bg-red-500/[0.06]
              text-red-500
            "
          >
            <AlertTriangle className="h-4 w-4" />
          </div>

          <div>
            <span
              className="
                text-[7px] font-bold uppercase
                tracking-[0.25em]
                text-red-500
              "
            >
              Control Center Error
            </span>

            <h2
              className="
                mt-2 text-xl font-normal
                text-foreground sm:text-2xl
              "
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              Failed to load Operations Control Center
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
              {dbError.message}
            </p>

            <p className="mt-3 text-[9px] leading-5 text-muted-foreground">
              Execute{" "}
              <code className="text-foreground">
                migration_milestone_2.sql
              </code>{" "}
              in the Supabase SQL editor to create the
              required tables.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ==========================================================================
     ATTENTION TOTAL
  ========================================================================== */

  const attentionTotal =
    newGuestEnquiries +
    pendingEventCases +
    pendingVendors +
    pendingVendorInvitations +
    waitingOMAssignment;

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <div className="space-y-6">

      {/* ======================================================================
          HEADER
      ====================================================================== */}

      <header
        className="
          relative overflow-hidden
          border-b border-border
          pb-6
        "
      >
        <div
          className="
            flex flex-col gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="h-px w-7 bg-accent-gold" />

              <span
                className="
                  text-[7px] font-bold uppercase
                  tracking-[0.28em]
                  text-accent-gold
                "
              >
                SAI Events · Administration
              </span>
            </div>

            <h1
              className="
                mt-3
                text-3xl font-normal
                tracking-[-0.025em]
                text-foreground
                sm:text-4xl
              "
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              Operations Control Center
            </h1>

            <p
              className="
                mt-2 max-w-xl
                text-[10px] leading-5
                text-muted-foreground
                sm:text-[11px]
              "
            >
              Monitor today's operations, resolve pending
              decisions and maintain control across events,
              vendors and operational teams.
            </p>
          </div>

          <div
            className="
              flex items-center gap-3
              border border-border
              bg-surface/50
              px-4 py-3
            "
          >
            <span className="relative flex h-2 w-2">
              <span
                className="
                  absolute inline-flex
                  h-full w-full
                  animate-ping rounded-full
                  bg-emerald-500 opacity-30
                "
              />

              <span
                className="
                  relative inline-flex
                  h-2 w-2 rounded-full
                  bg-emerald-500
                "
              />
            </span>

            <div>
              <span
                className="
                  block text-[6px]
                  font-bold uppercase
                  tracking-[0.2em]
                  text-muted-foreground/50
                "
              >
                Platform Status
              </span>

              <span className="mt-0.5 block text-[9px] font-semibold text-foreground">
                System Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================================
          COMMAND BOARD
      ====================================================================== */}

      <section className="border border-border bg-surface/45">

        {/* SECTION LABEL */}

        <div
          className="
            flex flex-col gap-3
            border-b border-border
            px-5 py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-2.5">
            <Zap className="h-3.5 w-3.5 text-accent-gold" />

            <span
              className="
                text-[8px] font-bold uppercase
                tracking-[0.24em]
                text-accent-gold
              "
            >
              Today's Command Board
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="
                text-[7px] font-bold uppercase
                tracking-[0.18em]
                text-muted-foreground/50
              "
            >
              Items requiring attention
            </span>

            <span
              className={`
                flex h-6 min-w-6
                items-center justify-center
                px-1.5
                text-[8px] font-bold

                ${
                  attentionTotal > 0
                    ? "bg-amber-500 text-black"
                    : "border border-border text-muted-foreground"
                }
              `}
            >
              {attentionTotal}
            </span>
          </div>
        </div>

        <div
          className="
            grid grid-cols-1
            xl:grid-cols-[0.72fr_1.28fr]
          "
        >
          {/* ================================================================
              TODAY FOCUS
          ================================================================ */}

          <Link
            href="/admin/bookings?filter=today"
            className="
              group relative
              min-h-[280px]
              overflow-hidden
              border-b border-border
              p-6
              transition-colors duration-500

              hover:bg-accent-gold/[0.025]

              sm:p-7
              xl:border-b-0
              xl:border-r
            "
          >
            {/* decorative number */}

            <span
              className="
                pointer-events-none
                absolute -bottom-10 right-2
                select-none
                text-[150px] font-normal
                leading-none
                text-foreground/[0.018]
                sm:text-[190px]
              "
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              {todaysEvents}
            </span>

            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between">
                <div
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    border border-accent-gold/25
                    bg-accent-gold/[0.05]
                    text-accent-gold
                  "
                >
                  <CalendarDays className="h-4 w-4" />
                </div>

                <ArrowRight
                  className="
                    h-4 w-4
                    text-muted-foreground
                    transition-all duration-300
                    group-hover:translate-x-1
                    group-hover:text-accent-gold
                  "
                />
              </div>

              <div className="mt-auto pt-12">
                <span
                  className="
                    text-[7px] font-bold uppercase
                    tracking-[0.25em]
                    text-accent-gold
                  "
                >
                  Live Today
                </span>

                <div className="mt-2 flex items-end gap-3">
                  <span
                    className="
                      text-6xl font-normal
                      leading-none
                      text-foreground
                      sm:text-7xl
                    "
                    style={{
                      fontFamily:
                        '"Playfair Display", serif',
                    }}
                  >
                    {todaysEvents}
                  </span>

                  <div className="pb-1.5">
                    <span className="block text-[10px] font-semibold text-foreground">
                      Events Today
                    </span>

                    <span className="mt-0.5 block text-[8px] text-muted-foreground">
                      {todaysEvents
                        ? "Currently scheduled for execution"
                        : "No executions scheduled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* ================================================================
              ATTENTION QUEUE
          ================================================================ */}

          <div>
            <div
              className="
                border-b border-border/70
                px-5 py-3
              "
            >
              <span
                className="
                  text-[7px] font-bold uppercase
                  tracking-[0.2em]
                  text-muted-foreground/55
                "
              >
                Administrative Attention Queue
              </span>
            </div>

            <AttentionRow
              href="/admin/enquiries"
              icon={<HelpCircle />}
              label="New Enquiries"
              description="Guest consultations awaiting contact"
              value={newGuestEnquiries}
              warning={newGuestEnquiries > 0}
            />

            <AttentionRow
              href="/admin/bookings?filter=pending"
              icon={<Clock />}
              label="Pending Event Cases"
              description="Customer requests awaiting review"
              value={pendingEventCases}
              warning={pendingEventCases > 0}
            />

            <AttentionRow
              href="/admin/vendors?tab=pending"
              icon={<Store />}
              label="Vendor Registrations"
              description="Supplier onboarding awaiting approval"
              value={pendingVendors}
              warning={pendingVendors > 0}
            />

            <AttentionRow
              href="/admin/vendor-invitations"
              icon={<Send />}
              label="Vendor Invitations"
              description="Category leads awaiting vendor response"
              value={pendingVendorInvitations}
              warning={pendingVendorInvitations > 0}
            />

            <AttentionRow
              href="/admin/assignments?filter=unassigned"
              icon={<Shield />}
              label="Waiting OM Assignment"
              description="Finalized cases requiring dispatch"
              value={waitingOMAssignment}
              danger={waitingOMAssignment > 0}
              last
            />
          </div>
        </div>
      </section>

      {/* ======================================================================
          OPERATIONAL HEALTH
      ====================================================================== */}

      <section
        className="
          border-y border-border
          bg-background/20
        "
      >
        <div
          className="
            flex items-center
            border-b border-border/60
            py-3
          "
        >
          <Activity className="mr-2 h-3.5 w-3.5 text-accent-gold" />

          <span
            className="
              text-[7px] font-bold uppercase
              tracking-[0.23em]
              text-muted-foreground
            "
          >
            Operational Health
          </span>
        </div>

        <div
          className="
            grid grid-cols-2
            lg:grid-cols-4
          "
        >
          <HealthMetric
            href="/admin/operational-managers?status=available"
            label="Available OMs"
            value={availableOMs}
            icon={<Briefcase />}
            state="success"
          />

          <HealthMetric
            href="/admin/bookings?filter=active"
            label="Events In Progress"
            value={activeEvents}
            icon={<Activity />}
            state="info"
          />

          <HealthMetric
            href="/admin/assignments?filter=delayed"
            label="Delayed Tasks"
            value={delayedEvents}
            icon={<AlertTriangle />}
            state={
              delayedEvents > 0
                ? "warning"
                : "neutral"
            }
          />

          <HealthMetric
            href="/admin/assignments?filter=escalated"
            label="Escalated Events"
            value={escalatedEvents}
            icon={<ShieldAlert />}
            state={
              escalatedEvents > 0
                ? "danger"
                : "neutral"
            }
            last
          />
        </div>
      </section>

      {/* ======================================================================
          QUICK COMMANDS
      ====================================================================== */}

      <section
        className="
          flex flex-col
          border border-border
          bg-surface/30
          lg:flex-row
          lg:items-stretch
        "
      >
        <div
          className="
            flex items-center
            border-b border-border
            px-5 py-4
            lg:w-[190px]
            lg:border-b-0
            lg:border-r
          "
        >
          <div>
            <span
              className="
                text-[7px] font-bold uppercase
                tracking-[0.24em]
                text-accent-gold
              "
            >
              Command Console
            </span>

            <p className="mt-1 text-[8px] text-muted-foreground">
              Common administrative actions
            </p>
          </div>
        </div>

        <div
          className="
            grid flex-1
            grid-cols-2
            md:grid-cols-4
          "
        >
          <CommandLink
            href="/admin/operational-managers"
            icon={<Briefcase />}
            label="OM Registry"
            description="Manage workforce"
          />

          <CommandLink
            href="/admin/bookings"
            icon={<GitBranch />}
            label="Review Cases"
            description="Event requests"
          />

          <CommandLink
            href="/admin/catalog"
            icon={<BookOpen />}
            label="Catalog"
            description="Services & pricing"
          />

          <CommandLink
            href="/admin/reports"
            icon={<TrendingUp />}
            label="Analytics"
            description="Performance reports"
            last
          />
        </div>
      </section>

      {/* ======================================================================
          MAIN OPERATIONS AREA
      ====================================================================== */}

      <div
        className="
          grid grid-cols-1
          gap-6
          xl:grid-cols-[1.55fr_0.75fr]
        "
      >
        {/* ================================================================
            UPCOMING EVENTS
        ================================================================ */}

        <section className="border border-border bg-surface/40">
          <div
            className="
              flex items-center
              justify-between gap-4
              border-b border-border
              px-5 py-4
            "
          >
            <div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-3.5 w-3.5 text-accent-gold" />

                <span
                  className="
                    text-[8px] font-bold uppercase
                    tracking-[0.23em]
                    text-accent-gold
                  "
                >
                  Upcoming Operations
                </span>
              </div>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Next scheduled event cases
              </p>
            </div>

            <Link
              href="/admin/bookings"
              className="
                group flex items-center gap-2
                text-[7px] font-bold uppercase
                tracking-[0.16em]
                text-muted-foreground
                transition-colors
                hover:text-accent-gold
              "
            >
              Registry

              <ArrowRight
                className="
                  h-3 w-3
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div
              className="
                flex min-h-[310px]
                flex-col items-center
                justify-center
                px-6 py-12
                text-center
              "
            >
              <CalendarDays className="h-5 w-5 text-accent-gold" />

              <h3
                className="
                  mt-4 text-xl font-normal
                  text-foreground
                "
                style={{
                  fontFamily:
                    '"Playfair Display", serif',
                }}
              >
                Operations calendar is clear.
              </h3>

              <p className="mt-1 text-[9px] text-muted-foreground">
                No upcoming event requests found.
              </p>
            </div>
          ) : (
            <div>
              {upcomingEvents.map((req, index) => {
                const date = new Date(req.event_date);

                const day = Number.isNaN(date.getTime())
                  ? "--"
                  : date
                      .getDate()
                      .toString()
                      .padStart(2, "0");

                const month = Number.isNaN(date.getTime())
                  ? "---"
                  : date
                      .toLocaleDateString("en-US", {
                        month: "short",
                      })
                      .toUpperCase();

                return (
                  <Link
                    key={req.id}
                    href={`/admin/bookings/${req.id}`}
                    className="
                      group grid
                      grid-cols-[55px_1fr]
                      gap-4
                      border-b border-border/70
                      px-5 py-5
                      transition-colors
                      last:border-b-0
                      hover:bg-accent-gold/[0.018]

                      sm:grid-cols-[65px_1fr_auto]
                      sm:items-center
                    "
                  >
                    {/* DATE */}

                    <div
                      className="
                        border-r border-border
                        pr-4 text-center
                      "
                    >
                      <span
                        className="
                          block text-[7px]
                          font-bold uppercase
                          tracking-[0.18em]
                          text-accent-gold
                        "
                      >
                        {month}
                      </span>

                      <span
                        className="
                          mt-1 block
                          text-2xl font-normal
                          leading-none
                          text-foreground
                        "
                        style={{
                          fontFamily:
                            '"Playfair Display", serif',
                        }}
                      >
                        {day}
                      </span>
                    </div>

                    {/* EVENT */}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="
                            truncate text-[11px]
                            font-semibold text-foreground
                            transition-colors
                            group-hover:text-accent-gold
                          "
                        >
                          {req.event_type}
                        </span>

                        {index === 0 && (
                          <span
                            className="
                              hidden border
                              border-accent-gold/20
                              bg-accent-gold/[0.05]
                              px-1.5 py-0.5
                              text-[5px] font-bold
                              uppercase tracking-[0.15em]
                              text-accent-gold
                              sm:inline
                            "
                          >
                            Next
                          </span>
                        )}
                      </div>

                      <div
                        className="
                          mt-2 flex flex-wrap
                          items-center gap-x-3 gap-y-1
                          text-[8px]
                          text-muted-foreground
                        "
                      >
                        <span className="flex items-center gap-1">
                          <UserRound className="h-2.5 w-2.5 text-accent-gold" />

                          {req.profiles?.full_name ||
                            "Client unavailable"}
                        </span>

                        <span className="flex min-w-0 items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 shrink-0 text-accent-gold" />

                          <span className="truncate">
                            {req.location ||
                              "Venue unavailable"}
                          </span>
                        </span>
                      </div>

                      {/* mobile budget */}

                      <div className="mt-3 sm:hidden">
                        <span className="font-mono text-[10px] font-semibold text-foreground">
                          ₹
                          {Number(
                            req.total_budget || 0
                          ).toLocaleString("en-IN")}
                        </span>

                        <span
                          className="
                            ml-2 border border-border
                            px-1.5 py-0.5
                            text-[6px] font-bold uppercase
                            tracking-[0.13em]
                            text-muted-foreground
                          "
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {/* BUDGET / STATUS */}

                    <div className="hidden text-right sm:block">
                      <span
                        className="
                          block font-mono
                          text-[11px] font-semibold
                          text-foreground
                        "
                      >
                        ₹
                        {Number(
                          req.total_budget || 0
                        ).toLocaleString("en-IN")}
                      </span>

                      <span
                        className="
                          mt-1.5 inline-block
                          border border-border
                          bg-background/40
                          px-2 py-1
                          text-[6px] font-bold
                          uppercase tracking-[0.14em]
                          text-muted-foreground
                        "
                      >
                        {req.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ================================================================
            LIVE ACTIVITY
        ================================================================ */}

        <section className="border border-border bg-surface/40">
          <div
            className="
              flex items-center
              justify-between
              border-b border-border
              px-5 py-4
            "
          >
            <div>
              <div className="flex items-center gap-2.5">
                <Activity className="h-3.5 w-3.5 text-accent-gold" />

                <span
                  className="
                    text-[8px] font-bold uppercase
                    tracking-[0.23em]
                    text-accent-gold
                  "
                >
                  Live Activity
                </span>
              </div>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Alerts and administrative actions
              </p>
            </div>

            <span className="relative flex h-2 w-2">
              <span
                className="
                  absolute inline-flex
                  h-full w-full
                  animate-ping rounded-full
                  bg-emerald-500 opacity-30
                "
              />

              <span
                className="
                  relative inline-flex
                  h-2 w-2 rounded-full
                  bg-emerald-500
                "
              />
            </span>
          </div>

          {/* NOTIFICATIONS */}

          <div className="border-b border-border">
            <div
              className="
                flex items-center
                justify-between
                px-5 py-3
                bg-background/20
              "
            >
              <span
                className="
                  text-[7px] font-bold uppercase
                  tracking-[0.2em]
                  text-muted-foreground/60
                "
              >
                Recent Alerts
              </span>

              <Link
                href="/admin/notifications"
                className="
                  text-[7px] font-semibold
                  text-accent-gold
                  hover:underline
                "
              >
                View all
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="px-5 py-7 text-center text-[9px] text-muted-foreground">
                No recent alerts.
              </div>
            ) : (
              <div>
                {recentNotifications
                  .slice(0, 3)
                  .map((ntf) => (
                    <div
                      key={ntf.id}
                      className="
                        flex gap-3
                        border-t border-border/50
                        px-5 py-3.5
                        first:border-t-0
                      "
                    >
                      <div
                        className="
                          mt-0.5 flex h-6 w-6
                          shrink-0 items-center
                          justify-center
                          border border-accent-gold/20
                          bg-accent-gold/[0.04]
                          text-accent-gold
                        "
                      >
                        <CircleAlert className="h-3 w-3" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <span className="truncate text-[8px] font-semibold text-foreground">
                            {ntf.user_name || "System"}
                          </span>

                          <span
                            className="
                              shrink-0 font-mono
                              text-[6px]
                              text-muted-foreground/50
                            "
                          >
                            {formatDate(
                              ntf.created_at
                            )}
                          </span>
                        </div>

                        <p
                          className="
                            mt-1 line-clamp-2
                            text-[8px] leading-4
                            text-muted-foreground
                          "
                        >
                          {ntf.message}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* AUDIT TRAIL */}

          <div>
            <div
              className="
                flex items-center
                justify-between
                bg-background/20
                px-5 py-3
              "
            >
              <span
                className="
                  text-[7px] font-bold uppercase
                  tracking-[0.2em]
                  text-muted-foreground/60
                "
              >
                Audit Trail
              </span>

              <Link
                href="/admin/status-history"
                className="
                  text-[7px] font-semibold
                  text-accent-gold
                  hover:underline
                "
              >
                Full log
              </Link>
            </div>

            {recentAuditLogs.length === 0 ? (
              <div className="px-5 py-7 text-center text-[9px] text-muted-foreground">
                No recent activity.
              </div>
            ) : (
              <div className="px-5 py-4">
                {recentAuditLogs
                  .slice(0, 4)
                  .map((log, index) => (
                    <div
                      key={log.id}
                      className="
                        relative flex gap-3
                        pb-4
                        last:pb-0
                      "
                    >
                      {index !==
                        Math.min(
                          recentAuditLogs.length,
                          4
                        ) -
                          1 && (
                        <span
                          className="
                            absolute left-[3px]
                            top-3 bottom-0
                            w-px bg-border
                          "
                        />
                      )}

                      <span
                        className="
                          relative mt-1
                          h-[7px] w-[7px]
                          shrink-0 rounded-full
                          border border-accent-gold
                          bg-background
                        "
                      />

                      <div className="min-w-0">
                        <span
                          className="
                            block truncate
                            text-[8px] font-semibold
                            text-foreground
                          "
                        >
                          {log.action}
                        </span>

                        <span
                          className="
                            mt-0.5 block
                            text-[7px]
                            text-muted-foreground
                          "
                        >
                          By{" "}
                          {log.profiles?.full_name ||
                            "System"}{" "}
                          ·{" "}
                          {new Date(
                            log.created_at
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============================================================================
   ATTENTION ROW
============================================================================ */

function AttentionRow({
  href,
  icon,
  label,
  description,
  value,
  warning = false,
  danger = false,
  last = false,
}: {
  href: string;
  icon: React.ReactElement;
  label: string;
  description: string;
  value: number;
  warning?: boolean;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group flex
        items-center gap-3
        px-5 py-4
        transition-colors duration-300
        hover:bg-accent-gold/[0.02]

        ${last ? "" : "border-b border-border/70"}
      `}
    >
      <span
        className={`
          flex h-8 w-8
          shrink-0 items-center
          justify-center
          border
          [&>svg]:h-3.5
          [&>svg]:w-3.5

          ${
            danger
              ? "border-red-500/20 bg-red-500/[0.05] text-red-500"
              : warning
                ? "border-amber-500/20 bg-amber-500/[0.05] text-amber-500"
                : "border-border bg-background/40 text-muted-foreground"
          }
        `}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <span
          className="
            block text-[9px]
            font-semibold text-foreground
            transition-colors
            group-hover:text-accent-gold
          "
        >
          {label}
        </span>

        <span
          className="
            mt-0.5 block truncate
            text-[7px]
            text-muted-foreground
          "
        >
          {description}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span
          className={`
            text-xl font-normal

            ${
              danger && value > 0
                ? "text-red-500"
                : warning && value > 0
                  ? "text-amber-500"
                  : "text-foreground"
            }
          `}
          style={{
            fontFamily:
              '"Playfair Display", serif',
          }}
        >
          {value}
        </span>

        <ArrowRight
          className="
            h-3.5 w-3.5
            text-muted-foreground/40
            transition-all duration-300
            group-hover:translate-x-1
            group-hover:text-accent-gold
          "
        />
      </div>
    </Link>
  );
}

/* ============================================================================
   HEALTH METRIC
============================================================================ */

function HealthMetric({
  href,
  label,
  value,
  icon,
  state,
  last = false,
}: {
  href: string;
  label: string;
  value: number;
  icon: React.ReactElement;
  state:
    | "success"
    | "info"
    | "warning"
    | "danger"
    | "neutral";
  last?: boolean;
}) {
  const stateClasses = {
    success: "text-emerald-500",
    info: "text-blue-500",
    warning: "text-amber-500",
    danger: "text-red-500",
    neutral: "text-foreground",
  };

  return (
    <Link
      href={href}
      className={`
        group relative
        flex items-center gap-3
        border-b border-r border-border
        py-4 pr-4
        transition-colors
        hover:bg-accent-gold/[0.018]

        even:border-r-0

        lg:border-b-0
        lg:even:border-r

        ${last ? "lg:border-r-0" : ""}
      `}
    >
      <span
        className={`
          flex h-8 w-8
          shrink-0 items-center
          justify-center
          [&>svg]:h-3.5
          [&>svg]:w-3.5
          ${stateClasses[state]}
        `}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className={`
              text-2xl font-normal
              ${stateClasses[state]}
            `}
            style={{
              fontFamily:
                '"Playfair Display", serif',
            }}
          >
            {value}
          </span>

          <span
            className="
              truncate text-[7px]
              font-bold uppercase
              tracking-[0.15em]
              text-muted-foreground
            "
          >
            {label}
          </span>
        </div>
      </div>

      <ArrowRight
        className="
          ml-auto h-3 w-3
          shrink-0
          text-muted-foreground/30
          transition-all
          group-hover:translate-x-1
          group-hover:text-accent-gold
        "
      />
    </Link>
  );
}

/* ============================================================================
   COMMAND LINK
============================================================================ */

function CommandLink({
  href,
  icon,
  label,
  description,
  last = false,
}: {
  href: string;
  icon: React.ReactElement;
  label: string;
  description: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group flex
        items-center gap-3
        border-b border-r border-border
        px-4 py-4
        transition-all duration-300
        hover:bg-accent-gold/[0.035]

        even:border-r-0

        md:border-b-0
        md:even:border-r

        ${last ? "md:border-r-0" : ""}
      `}
    >
      <span
        className="
          flex h-8 w-8
          shrink-0 items-center
          justify-center
          text-accent-gold
          [&>svg]:h-3.5
          [&>svg]:w-3.5
        "
      >
        {icon}
      </span>

      <div className="min-w-0">
        <span
          className="
            block truncate
            text-[8px] font-semibold
            text-foreground
            transition-colors
            group-hover:text-accent-gold
          "
        >
          {label}
        </span>

        <span
          className="
            mt-0.5 block truncate
            text-[6px]
            text-muted-foreground
          "
        >
          {description}
        </span>
      </div>

      <ArrowRight
        className="
          ml-auto h-3 w-3
          shrink-0
          text-muted-foreground/30
          transition-all
          group-hover:translate-x-1
          group-hover:text-accent-gold
        "
      />
    </Link>
  );
}

