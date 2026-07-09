"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Phone, Mail, MapPin, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  address: string | null;
  created_at: string;
  totalRequests: number;
}

interface CustomersListProps {
  customers: Customer[];
}

export default function CustomersList({ customers }: CustomersListProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const query = filterQuery.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.phone_number || "").includes(query)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      
      {/* Search Filter Toolbar */}
      <input
        type="text"
        placeholder="Search clients by name, email address, or phone number..."
        value={filterQuery}
        onChange={(e) => setFilterQuery(e.target.value)}
        className="w-full sm:max-w-md px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground"
      />

      {/* Customers Cards / Expandable Registry */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow transition duration-200">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-xs text-muted-foreground border border-dashed border-border rounded-2xl m-6 bg-background/5">
            No customer profiles matched the query.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredCustomers.map((customer) => {
              const isExpanded = expandedId === customer.id;
              return (
                <div key={customer.id} className="transition duration-150 hover:bg-surface-raised/10">
                  {/* Row Summary */}
                  <div 
                    onClick={() => toggleExpand(customer.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-accent-gold font-bold text-xs uppercase">
                        {customer.full_name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{customer.full_name}</h4>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Joined: {formatDate(customer.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 min-w-[120px]">
                        <Phone className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                        <span>{customer.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-[160px] truncate max-w-[200px] font-sans">
                        <Mail className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <span>{customer.totalRequests} Requests</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 border border-border bg-background hover:bg-surface-raised rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
                        title="View Full Profile Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-accent-gold" />
                      </Link>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-1 border-t border-border/30 bg-background/20 space-y-4 animate-fade-in text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-accent-gold" /> Venue Address
                          </span>
                          <p className="text-foreground leading-relaxed pl-4 text-[11px]">
                            {customer.address || "No venue address specified on profile."}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-accent-gold" /> Client Identifier
                          </span>
                          <p className="font-mono text-muted-foreground pl-4 text-[10px]">{customer.id}</p>
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
