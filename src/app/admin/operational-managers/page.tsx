import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  BriefcaseBusiness,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import OMRegistryClient from "./OMRegistryClient";

export default async function AdminOperationalManagersPage() {
  const supabase = await createClient();

  let managers: any[] = [];
  let tableMissing = false;
  let dbError: Error | null = null;

  try {
    const { data, error } = await supabase
      .from("operational_managers")
      .select(`
        *,
        profiles:id (
          id,
          full_name,
          email,
          phone_number,
          address
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    managers = data || [];
  } catch (err: any) {
    dbError = err;
  }

  if (dbError) {
    return (
      <div className="w-full">
        <div
          className="
            relative overflow-hidden
            border border-red-500/20
            bg-red-500/[0.05]
            p-5 sm:p-6
          "
        >
          <div className="absolute left-0 top-0 h-full w-[2px] bg-red-500/70" />

          <div className="flex items-start gap-4">
            <div
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                border border-red-500/20
                bg-red-500/10
                text-red-500
              "
            >
              <Activity className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-red-500/70">
                System Notice
              </span>

              <h2
                className="mt-1 text-xl font-normal text-foreground"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Operations registry unavailable
              </h2>

              <p className="mt-2 break-words text-xs leading-6 text-muted-foreground">
                {dbError.message}
              </p>

              <p className="mt-3 text-[10px] leading-5 text-muted-foreground/70">
                Execute{" "}
                <code className="text-accent-gold">
                  migration_milestone_2.sql
                </code>{" "}
                in the Supabase SQL editor to create the required tables.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeManagers = managers.filter(
    (manager) => manager.employment_status === "Active"
  ).length;

  const availableManagers = managers.filter(
    (manager) => manager.availability_status === "Available"
  ).length;

  const totalWorkload = managers.reduce(
    (sum, manager) => sum + (Number(manager.current_workload) || 0),
    0
  );

  return (
    <div className="w-full space-y-7 sm:space-y-9 animate-fade-in-up">

      {/* ============================================================
          ADMIN PAGE HEADER
      ============================================================ */}

      <section
        className="
          relative overflow-hidden
          border-b border-border/70
          pb-7 sm:pb-9
        "
      >
        {/* subtle background numbering */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            -right-2 -top-7
            hidden
            text-[8rem]
            font-normal
            leading-none
            text-foreground/[0.018]
            lg:block
          "
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          04
        </span>

        <div
          className="
            flex flex-col gap-6
            lg:flex-row lg:items-end lg:justify-between
          "
        >
          <div className="max-w-3xl">

            {/* eyebrow */}

            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-accent-gold" />

              <BriefcaseBusiness className="h-3.5 w-3.5 text-accent-gold" />

              <span
                className="
                  text-[8px] font-bold uppercase
                  tracking-[0.3em]
                  text-accent-gold
                "
              >
                Workforce Operations
              </span>
            </div>

            <h1
              className="
                text-[clamp(2.25rem,5vw,4.5rem)]
                font-normal
                leading-[0.95]
                tracking-[-0.04em]
                text-foreground
              "
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Operations
              <span className="italic text-accent-gold"> Team.</span>
            </h1>

            <p
              className="
                mt-4 max-w-2xl
                text-xs sm:text-sm
                font-light leading-[1.8]
                text-muted-foreground
              "
            >
              Manage the internal team responsible for coordinating SAI Events,
              review workload capacity, geographical coverage, availability and
              employment status from one operational registry.
            </p>
          </div>

          {/* admin ownership indicator */}

          <div
            className="
              flex w-fit items-center gap-3
              border border-border
              bg-surface/60
              px-4 py-3
            "
          >
            <div
              className="
                flex h-8 w-8 items-center justify-center
                border border-accent-gold/20
                bg-accent-gold/[0.06]
                text-accent-gold
              "
            >
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div>
              <span
                className="
                  block text-[7px] font-bold uppercase
                  tracking-[0.25em]
                  text-muted-foreground
                "
              >
                Registry Control
              </span>

              <span className="mt-0.5 block text-[10px] font-semibold text-foreground">
                Admin Managed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          QUICK OPERATIONS SUMMARY
      ============================================================ */}

      <section
        className="
          grid grid-cols-2
          border border-border
          bg-surface/40
          lg:grid-cols-4
        "
      >
        <SummaryMetric
          icon={<UsersRound className="h-4 w-4" />}
          label="Registered"
          value={managers.length}
          suffix="Managers"
        />

        <SummaryMetric
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Active"
          value={activeManagers}
          suffix="Employees"
        />

        <SummaryMetric
          icon={<Activity className="h-4 w-4" />}
          label="Available"
          value={availableManagers}
          suffix="Right Now"
        />

        <SummaryMetric
          icon={<BriefcaseBusiness className="h-4 w-4" />}
          label="Live Workload"
          value={totalWorkload}
          suffix="Events"
          last
        />
      </section>

      {/* ============================================================
          REGISTRY
      ============================================================ */}

      <OMRegistryClient
        initialManagers={managers}
        databasePending={tableMissing}
      />
    </div>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
  suffix,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        group relative
        min-w-0
        p-4 sm:p-5
        transition-colors duration-300
        hover:bg-accent-gold/[0.025]

        ${!last ? "border-r border-border" : ""}
        [&:nth-child(2)]:border-r-0
        lg:[&:nth-child(2)]:border-r
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="
            text-[7px] font-bold uppercase
            tracking-[0.24em]
            text-muted-foreground
          "
        >
          {label}
        </span>

        <span className="text-accent-gold/60">
          {icon}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span
          className="
            text-3xl sm:text-4xl
            font-normal leading-none
            text-foreground
          "
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {value}
        </span>

        <span
          className="
            mb-0.5 hidden
            text-[7px] font-bold uppercase
            tracking-[0.18em]
            text-muted-foreground/60
            sm:block
          "
        >
          {suffix}
        </span>
      </div>

      <div
        className="
          absolute bottom-0 left-0
          h-[2px] w-0
          bg-accent-gold
          transition-all duration-500
          group-hover:w-full
        "
      />
    </div>
  );
}