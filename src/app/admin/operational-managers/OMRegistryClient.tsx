"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  createOperationalManager, 
  updateOperationalManager, 
  updateOMEmploymentStatus, 
  resetOMPassword 
} from "./actions";
import { 
  Briefcase, Users, UserCheck, UserX, Trash2, Key, Edit, 
  Plus, X, Mail, Phone, MapPin, Calendar, Award, Activity, AlertCircle 
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface OMProfile {
  id: string;
  employee_id: string;
  designation: string;
  assigned_regions: string[];
  assigned_cities: string[];
  availability_status: string;
  employment_status: string;
  joining_date: string;
  current_workload: number;
  performance_score: number;
  completion_rate: number;
  profile_photo: string | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    address: string | null;
  } | null;
}

interface OMRegistryClientProps {
  initialManagers: OMProfile[];
  databasePending?: boolean;
}

export default function OMRegistryClient({ initialManagers, databasePending = false }: OMRegistryClientProps) {
  const [managers, setManagers] = useState<OMProfile[]>(initialManagers);
  const [isPending, startTransition] = useTransition();
  
  // Drawer & Form states
  const [selectedOM, setSelectedOM] = useState<OMProfile | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // OM Form state
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("Coordinator");
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);
  const [tempPassword, setTempPassword] = useState("Test@123");
  
  // Edit Form state
  const [editOM, setEditOM] = useState<OMProfile | null>(null);

  const resetForm = () => {
    setFullName("");
    setEmployeeId("");
    setEmail("");
    setPhone("");
    setDesignation("Coordinator");
    setRegions([]);
    setCities([]);
    setAddress("");
    setJoiningDate(new Date().toISOString().split("T")[0]);
    setTempPassword("Test@123");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !employeeId || !email || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createOperationalManager({
          fullName,
          employeeId,
          email,
          phone,
          designation,
          regions,
          cities,
          address,
          joiningDate,
          temporaryPassword: tempPassword || undefined,
        });

        if (res.success) {
          alert("Operational Manager account created! An activation notification has been generated.");
          setIsAdding(false);
          resetForm();
          window.location.reload();
        }
      } catch (err: any) {
        alert(err.message || "Failed to create manager.");
      }
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOM) return;

    startTransition(async () => {
      try {
        const res = await updateOperationalManager(editOM.id, {
          fullName: editOM.profiles?.full_name || "",
          phone: editOM.profiles?.phone_number || "",
          address: editOM.profiles?.address || "",
          designation: editOM.designation,
          regions: editOM.assigned_regions,
          cities: editOM.assigned_cities,
          availabilityStatus: editOM.availability_status as any,
          employmentStatus: editOM.employment_status as any,
          profilePhoto: editOM.profile_photo || undefined,
        });

        if (res.success) {
          alert("Operational Manager profile updated.");
          setIsEditing(false);
          setEditOM(null);
          window.location.reload();
        }
      } catch (err: any) {
        alert(err.message || "Failed to update profile.");
      }
    });
  };

  const handleStatusChange = async (omId: string, nextStatus: OMProfile["employment_status"]) => {
    if (!confirm(`Are you sure you want to transition this manager's employment status to ${nextStatus}?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await updateOMEmploymentStatus(omId, nextStatus as any);
        alert(`Status updated to ${nextStatus}.`);
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Failed to change status.");
      }
    });
  };

  const handlePasswordReset = async (om: OMProfile) => {
    if (!confirm(`Trigger password reset request for ${om.profiles?.full_name}? This will send a reset password email link.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await resetOMPassword(om.id, om.profiles?.email || "");
        alert("Password reset request sent successfully.");
      } catch (err: any) {
        alert(err.message || "Failed to request password reset.");
      }
    });
  };

  const toggleRegion = (reg: string) => {
    setRegions((prev) => 
      prev.includes(reg) ? prev.filter((r) => r !== reg) : [...prev, reg]
    );
  };

  const toggleCity = (city: string) => {
    setCities((prev) => 
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* DB Migration Note */}
      {databasePending && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs rounded-2xl">
          <strong>⚠️ Operations Team is running on mock data:</strong> Run the migration in `migration_milestone_2.sql` to connect and register real employees.
        </div>
      )}

      {/* Action Header */}
      <div className="flex justify-between items-center bg-surface border border-border p-4 rounded-2xl shadow-sm hover:shadow transition duration-200">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
          Total Employees: {managers.length}
        </span>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-accent-gold text-black rounded-xl text-xs font-bold hover:scale-[1.01] transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Manager</span>
        </button>
      </div>

      {/* Manager Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {managers.length === 0 ? (
          <div className="col-span-full text-center py-20 text-xs text-muted-foreground border border-dashed border-border bg-surface rounded-2xl">
            No Operational Managers registered yet.
          </div>
        ) : (
          managers.map((om) => {
            const wlPct = Math.min(100, (om.current_workload / 5) * 100);
            const workloadColor = om.current_workload >= 4 ? "bg-red-500" : om.current_workload >= 2 ? "bg-amber-500" : "bg-emerald-500";
            return (
              <div 
                key={om.id} 
                className="bg-surface border border-border rounded-2xl p-5 hover:border-accent-gold/25 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-foreground truncate">{om.profiles?.full_name}</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{om.designation} · ID: {om.employee_id}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-bold border rounded-md ${
                      om.employment_status === "Active" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : om.employment_status === "Suspended"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                    }`}>
                      {om.employment_status}
                    </span>
                  </div>

                  {/* OM Info */}
                  <div className="space-y-2 text-[10px] text-muted-foreground pt-3.5 border-t border-border/40">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-accent-gold font-mono" /><span>{om.profiles?.email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-accent-gold" /><span>{om.profiles?.phone_number}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-accent-gold" /><span>{om.profiles?.address || "No Address"}</span></div>
                    {om.assigned_regions?.length > 0 && (
                      <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-accent-gold" /><span className="truncate">Regions: {om.assigned_regions.join(", ")}</span></div>
                    )}
                  </div>

                  {/* Workload Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
                      <span>Active Workload</span>
                      <span>{om.current_workload}/5 Events ({wlPct}%)</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                      <div className={`${workloadColor} h-1.5 rounded-full transition-all duration-300`} style={{ width: `${wlPct}%` }} />
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2.5 pt-3.5 border-t border-border/40 text-center text-[10px]">
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase tracking-wider text-muted-foreground block font-bold">Rating</span>
                      <span className="font-bold text-foreground flex items-center justify-center gap-0.5"><Award className="w-3 h-3 text-accent-gold" />{om.performance_score}/5.0</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase tracking-wider text-muted-foreground block font-bold">Comp. Rate</span>
                      <span className="font-bold text-foreground">{om.completion_rate}%</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase tracking-wider text-muted-foreground block font-bold">Availability</span>
                      <span className={`font-bold ${om.availability_status === "Available" ? "text-emerald-500" : "text-amber-500"}`}>{om.availability_status}</span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="grid grid-cols-3 gap-2.5 pt-5 border-t border-border/40 mt-5">
                  <button
                    onClick={() => { setEditOM(om); setIsEditing(true); }}
                    className="w-full py-1.5 bg-background border border-border hover:border-accent-gold/40 hover:text-accent-gold text-foreground rounded-lg text-xxs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handlePasswordReset(om)}
                    className="w-full py-1.5 bg-background border border-border hover:border-accent-gold/40 hover:text-accent-gold text-foreground rounded-lg text-xxs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3" /> Reset PW
                  </button>
                  {om.employment_status === "Active" ? (
                    <button
                      onClick={() => handleStatusChange(om.id, "Suspended")}
                      className="w-full py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xxs font-bold hover:bg-red-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UserX className="w-3 h-3" /> Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(om.id, "Active")}
                      className="w-full py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xxs font-bold hover:bg-emerald-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3 h-3" /> Activate
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── DRAWERS/MODALS ── */}

      {/* A. Onboarding / Addition Modal */}
      {isAdding && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 py-8 animate-fade-in">
            <div className="bg-[#0d0b08] border border-border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col animate-scale-in">
              <div className="flex justify-between items-center p-5 border-b border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Onboard Operational Manager</h3>
                <button onClick={() => { setIsAdding(false); resetForm(); }} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Employee ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="OM-2026-X"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground font-semibold transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground font-mono transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground font-mono transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Designation</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Joining Date</label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground font-mono transition-all duration-200"
                  />
                </div>

                {/* Assignment Regions & Cities checkboxes */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <h5 className="text-[10px] font-bold uppercase text-muted-foreground">Assign Regional Coverage</h5>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground">Regions</span>
                      <div className="flex flex-wrap gap-2">
                        {["North", "South", "East", "West", "Central"].map((reg) => (
                          <button
                            key={reg}
                            type="button"
                            onClick={() => toggleRegion(reg)}
                            className={`px-3 py-1 border rounded-lg text-xxs font-semibold cursor-pointer transition ${
                              regions.includes(reg) 
                                ? "bg-accent-gold border-accent-gold text-black" 
                                : "bg-surface border-border text-muted-foreground"
                            }`}
                          >
                            {reg}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground">Cities</span>
                      <div className="flex flex-wrap gap-2">
                        {["Hyderabad", "Bangalore", "Chennai", "Mumbai", "Delhi"].map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => toggleCity(city)}
                            className={`px-3 py-1 border rounded-lg text-xxs font-semibold cursor-pointer transition ${
                              cities.includes(city) 
                                ? "bg-accent-gold border-accent-gold text-black" 
                                : "bg-surface border-border text-muted-foreground"
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Address</label>
                  <textarea
                    placeholder="Employee home address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-14 px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2.5 bg-accent-gold text-black rounded-xl text-xs font-bold hover:scale-[1.01] transition disabled:opacity-50 cursor-pointer shadow-md shadow-accent-gold/10"
                >
                  {isPending ? "Creating account..." : "Submit & Register Employee"}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* B. Edit Modal */}
      {isEditing && editOM && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 py-8 animate-fade-in">
            <div className="bg-[#0d0b08] border border-border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col animate-scale-in">
              <div className="flex justify-between items-center p-5 border-b border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Edit Manager Profile</h3>
                <button onClick={() => { setIsEditing(false); setEditOM(null); }} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editOM.profiles?.full_name || ""}
                      onChange={(e) => setEditOM({
                        ...editOM,
                        profiles: editOM.profiles ? { ...editOM.profiles, full_name: e.target.value } : null
                      })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editOM.profiles?.phone_number || ""}
                      onChange={(e) => setEditOM({
                        ...editOM,
                        profiles: editOM.profiles ? { ...editOM.profiles, phone_number: e.target.value } : null
                      })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Designation</label>
                    <input
                      type="text"
                      value={editOM.designation}
                      onChange={(e) => setEditOM({ ...editOM, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Availability Status</label>
                    <select
                      value={editOM.availability_status}
                      onChange={(e) => setEditOM({ ...editOM, availability_status: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground font-semibold transition-all duration-200"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Training">Training</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Regions (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. South, North"
                    value={editOM.assigned_regions.join(", ")}
                    onChange={(e) => setEditOM({
                      ...editOM,
                      assigned_regions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground font-semibold transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Cities (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, Hyderabad"
                    value={editOM.assigned_cities.join(", ")}
                    onChange={(e) => setEditOM({
                      ...editOM,
                      assigned_cities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground font-semibold transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Address</label>
                  <textarea
                    value={editOM.profiles?.address || ""}
                    onChange={(e) => setEditOM({
                      ...editOM,
                      profiles: editOM.profiles ? { ...editOM.profiles, address: e.target.value } : null
                    })}
                    className="w-full h-14 px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2.5 bg-accent-gold text-black rounded-xl text-xs font-bold hover:scale-[1.01] transition disabled:opacity-50 cursor-pointer shadow-md shadow-accent-gold/10"
                >
                  {isPending ? "Saving changes..." : "Save Profile Details"}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
