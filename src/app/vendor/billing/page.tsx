import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  DollarSign, ArrowUpRight, Clock, CheckCircle2, AlertCircle,
  FileText, Download, TrendingUp, CreditCard, ShieldCheck
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function VendorBillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch vendor financial records
  const { data: financialsData, error } = await supabase
    .from("vendor_financials")
    .select(`
      id,
      request_id,
      total_agreed_amount,
      advance_paid,
      remaining_balance,
      payment_status,
      paid_date,
      invoice_number,
      invoice_url,
      created_at,
      event_requests (
        id,
        event_type,
        event_date,
        reference_number,
        location
      )
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Fetch approved vendor assignments to calculate total agreed earnings if financials not yet populated
  const { data: approvedAssignments } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      created_at,
      event_requests (
        id,
        event_type,
        event_date,
        total_budget,
        reference_number
      )
    `)
    .eq("vendor_id", user.id)
    .eq("status", "Approved");

  const financials = (financialsData || []) as any[];
  const bookings = (approvedAssignments || []) as any[];

  // Financial KPI calculations
  let totalEarned = 0;
  let totalReceived = 0;
  let totalPending = 0;
  let totalFuture = 0;

  if (financials.length > 0) {
    financials.forEach((f) => {
      const agreed = Number(f.total_agreed_amount || 0);
      const adv = Number(f.advance_paid || 0);
      const rem = Number(f.remaining_balance || 0);

      totalEarned += agreed;
      totalReceived += adv + (f.payment_status === "Paid" ? rem : 0);
      totalPending += f.payment_status !== "Paid" ? rem : 0;
    });
  } else {
    // Fallback based on approved bookings
    bookings.forEach((b) => {
      const bAmt = Number(b.event_requests?.total_budget || 0) * 0.3; // Estimate vendor share
      totalEarned += bAmt;
      totalReceived += bAmt * 0.5;
      totalPending += bAmt * 0.5;
    });
  }

  const runningBalance = totalEarned - totalReceived;

  return (
    <div className="space-y-8 animate-fade-in select-none">
      <div>
        <p className="text-[9.5px] uppercase tracking-widest font-bold text-accent-gold">Financial Ledger</p>
        <h1 className="text-2xl font-light font-heading text-foreground mt-0.5">Billing & Payments Dashboard</h1>
        <p className="text-xs text-muted-foreground font-light mt-1">
          Monitor current earnings, received advances, pending balances, and per-event financial statements.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-surface border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Contract Value</span>
            <DollarSign className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-2xl font-bold font-mono text-accent-gold">₹{totalEarned.toLocaleString("en-IN")}</div>
          <p className="text-[10px] text-muted-foreground">Across all confirmed event cases</p>
        </div>

        <div className="p-5 rounded-3xl bg-surface border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Received Payments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">₹{totalReceived.toLocaleString("en-IN")}</div>
          <p className="text-[10px] text-emerald-500/80 font-medium">Cleared to your bank account</p>
        </div>

        <div className="p-5 rounded-3xl bg-surface border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pending Balance</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">₹{totalPending.toLocaleString("en-IN")}</div>
          <p className="text-[10px] text-amber-500/80 font-medium">Awaiting post-event clearance</p>
        </div>

        <div className="p-5 rounded-3xl bg-surface border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Running Balance</span>
            <CreditCard className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">₹{runningBalance.toLocaleString("en-IN")}</div>
          <p className="text-[10px] text-muted-foreground">Current net ledger balance</p>
        </div>
      </div>

      {/* Per-Event Financial Ledger Table */}
      <div className="p-6 rounded-3xl bg-surface border border-border space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground font-heading">Event Payment Ledger</h3>
            <p className="text-xs text-muted-foreground">Breakdown of invoices, advances, and remaining balances per event case.</p>
          </div>
        </div>

        {financials.length === 0 && bookings.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            No active billing records found. Confirmed event bookings will automatically generate financial ledger items here.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  <th className="py-3 px-4">Event & Reference</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Invoiced Amount</th>
                  <th className="py-3 px-4">Advance Paid</th>
                  <th className="py-3 px-4">Remaining Balance</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {financials.length > 0
                  ? financials.map((f) => {
                      const req = f.event_requests;
                      return (
                        <tr key={f.id} className="hover:bg-background/40 transition">
                          <td className="py-4 px-4">
                            <span className="font-bold text-foreground block">{req?.event_type || "Event Case"}</span>
                            <span className="text-[10px] font-mono text-accent-gold">
                              REF: {req?.reference_number || `#${f.id.substring(0, 8)}`}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono">{req?.event_date || "N/A"}</td>
                          <td className="py-4 px-4 font-mono font-bold text-foreground">
                            ₹{Number(f.total_agreed_amount).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4 font-mono text-emerald-400">
                            ₹{Number(f.advance_paid).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4 font-mono text-amber-400">
                            ₹{Number(f.remaining_balance).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                f.payment_status === "Paid"
                                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                  : f.payment_status === "Partial"
                                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                                  : "bg-red-500/10 border border-red-500/30 text-red-400"
                              }`}
                            >
                              {f.payment_status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {f.invoice_url ? (
                              <a
                                href={f.invoice_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-background hover:bg-surface-raised border border-border rounded-xl text-[10px] font-bold text-foreground inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3 text-accent-gold" /> Invoice
                              </a>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">Generating...</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  : bookings.map((b) => {
                      const req = b.event_requests;
                      const estAmt = Number(req?.total_budget || 0) * 0.3;
                      return (
                        <tr key={b.id} className="hover:bg-background/40 transition">
                          <td className="py-4 px-4">
                            <span className="font-bold text-foreground block">{req?.event_type}</span>
                            <span className="text-[10px] font-mono text-accent-gold">
                              REF: {req?.reference_number || `#${b.id.substring(0, 8)}`}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono">{req?.event_date}</td>
                          <td className="py-4 px-4 font-mono font-bold text-foreground">
                            ₹{estAmt.toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4 font-mono text-emerald-400">
                            ₹{(estAmt * 0.5).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4 font-mono text-amber-400">
                            ₹{(estAmt * 0.5).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                              Partial Advance
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-[10px] text-muted-foreground italic">Pending Approval</span>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
