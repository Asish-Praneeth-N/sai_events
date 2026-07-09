"use client";

import React, { useState, useTransition } from "react";
import { User, Phone, Mail, MapPin, ChevronDown, ChevronUp, ShieldAlert, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { updateUserRole } from "@/app/admin/users/actions";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  business_name: string | null;
  address: string | null;
  created_at: string;
}

interface UsersListProps {
  initialUsers: Profile[];
  currentUserId: string;
}

export default function UsersList({ initialUsers, currentUserId }: UsersListProps) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [filterQuery, setFilterQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = async (userId: string, newRole: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setUpdatingId(userId);

    startTransition(async () => {
      try {
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
          setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
          );
          setSuccessMessage(`User role updated to ${newRole} successfully.`);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to update user role.");
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const filteredUsers = users.filter((u) => {
    const query = filterQuery.toLowerCase();
    const matchesQuery =
      u.full_name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.phone_number || "").includes(query);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-rose-500/10 border-rose-500/25 text-rose-500";
      case "operational_manager":
        return "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400";
      case "vendor":
        return "bg-blue-500/10 border-blue-500/25 text-blue-500";
      default:
        return "bg-emerald-500/10 border-emerald-500/25 text-emerald-500";
    }
  };

  const formatRoleLabel = (role: string) => {
    return role.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <input
          type="text"
          placeholder="Search users by name, email, or phone..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2.5 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground transition duration-150"
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-accent-gold/45 text-foreground cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="operational_manager">Operational Manager</option>
            <option value="vendor">Vendor</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Notifications banner */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs rounded-xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-950/40 border border-red-800/40 text-red-400 text-xs rounded-xl animate-fade-in flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Users Expandable Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow transition duration-200">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-xs text-muted-foreground border border-dashed border-border rounded-2xl m-6 bg-background/5">
            No users matched the criteria.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredUsers.map((user) => {
              const isExpanded = expandedId === user.id;
              const isCurrentUser = user.id === currentUserId;
              const isUpdating = updatingId === user.id;

              return (
                <div key={user.id} className="transition duration-150 hover:bg-surface-raised/10">
                  {/* Summary Row */}
                  <div 
                    onClick={() => toggleExpand(user.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-accent-gold font-black text-xs uppercase">
                        {user.full_name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-foreground">{user.full_name}</h4>
                          {isCurrentUser && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-accent-gold/15 border border-accent-gold/30 text-accent-gold px-1.5 py-0.5 rounded-md">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Member since: {formatDate(user.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:gap-8 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 min-w-[120px]">
                        <Phone className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                        <span>{user.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-[160px] truncate max-w-[200px] font-sans">
                        <Mail className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                        <span>{user.email}</span>
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-xl border ${getRoleBadgeStyle(user.role)}`}>
                          {formatRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Management Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-2 border-t border-border/30 bg-background/25 space-y-4 animate-fade-in text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Detail Column 1 */}
                        <div className="space-y-1 md:col-span-2">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-accent-gold" /> Address Details
                          </span>
                          <p className="text-foreground pl-4 text-[11px] leading-relaxed">
                            {user.address || "No address details specified on user profile."}
                          </p>
                          {user.business_name && (
                            <p className="pl-4 text-[11px] mt-2">
                              <span className="font-semibold">Business Name:</span> {user.business_name}
                            </p>
                          )}
                        </div>

                        {/* Detail Column 2: Role Management */}
                        <div className="space-y-3 p-4 bg-surface border border-border rounded-xl">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Configure User Role
                          </span>

                          <div className="space-y-2">
                            <select
                              value={user.role}
                              disabled={isCurrentUser || isUpdating}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-accent-gold/45 text-foreground disabled:opacity-50 cursor-pointer"
                            >
                              <option value="customer">Customer</option>
                              <option value="vendor">Vendor</option>
                              <option value="operational_manager">Operational Manager</option>
                              <option value="admin">Admin</option>
                            </select>

                            {isCurrentUser && (
                              <p className="text-[9px] text-amber-500 leading-tight">
                                Self-demotion is disabled to prevent admin lockout.
                              </p>
                            )}

                            {isUpdating && (
                              <div className="flex items-center gap-1.5 text-[9px] text-accent-gold font-bold">
                                <span className="animate-spin relative h-2.5 w-2.5 border-t border-accent-gold rounded-full" />
                                <span>Updating Role...</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-border/40 font-mono text-[9px] text-muted-foreground">
                            UID: {user.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
