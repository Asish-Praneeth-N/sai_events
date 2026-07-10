"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createApiClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { logAuditRecord, logNotification } from "../actions";

// Create a non-session-persisting API client for safe background signups
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createApiClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

interface CreateOMInput {
  fullName: string;
  employeeId: string;
  email: string;
  phone: string;
  designation: string;
  regions: string[];
  cities: string[];
  address: string;
  joiningDate: string;
  temporaryPassword?: string;
}

export async function createOperationalManager(data: CreateOMInput) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Verify caller is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const hostHeaders = await headers();
  
  // Resolve origin dynamically
  let origin = "";
  const referer = hostHeaders.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      origin = url.origin;
    } catch {
      // ignore
    }
  }
  
  if (!origin) {
    const host = hostHeaders.get("x-forwarded-host") || hostHeaders.get("host");
    if (host) {
      const proto = hostHeaders.get("x-forwarded-proto") || "http";
      origin = `${proto}://${host}`;
    }
  }
  
  if (!origin) {
    origin = hostHeaders.get("origin") || "http://localhost:3000";
  }

  // 2. Register user in Supabase Auth (with specific temporary password)
  const password = data.temporaryPassword || "Test@123";
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email: data.email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        role: "operational_manager",
        full_name: data.fullName,
        phone_number: data.phone,
        address: data.address,
      },
    },
  });

  if (authError) throw new Error(`Auth registration failed: ${authError.message}`);
  const omUserId = authData.user?.id;
  if (!omUserId) throw new Error("Failed to register auth user.");

  // 3. Trigger synced profile role update to operational_manager
  await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      phone_number: data.phone,
      address: data.address,
      role: "operational_manager",
    })
    .eq("id", omUserId);

  // 4. Create metadata entry in operational_managers
  const { error: metadataErr } = await supabase
    .from("operational_managers")
    .insert({
      id: omUserId,
      employee_id: data.employeeId,
      designation: data.designation,
      assigned_regions: data.regions,
      assigned_cities: data.cities,
      joining_date: data.joiningDate,
      availability_status: "Inactive",
      employment_status: "Onboarding",
      created_by_admin: user.id,
      requires_password_change: true,
    });

  if (metadataErr) {
    // Attempt rollback of profile to prevent orphaned data
    await supabase.from("profiles").delete().eq("id", omUserId);
    throw new Error(`Workforce creation failed: ${metadataErr.message}`);
  }

  // 5. Log workforce audit logs & notifications
  await logAuditRecord("Operational Manager Created", "operational_manager", omUserId, {
    employee_id: data.employeeId,
    email: data.email,
  });

  await logNotification({
    userId: omUserId,
    userType: "operational_manager",
    userName: data.fullName,
    message: `Welcome, ${data.fullName}! Your Operational Manager account (${data.employeeId}) has been registered by admin. Please login and complete onboarding.`,
  });

  revalidatePath("/admin/operational-managers");
  return { success: true, id: omUserId };
}

export async function updateOperationalManager(
  omId: string,
  data: {
    fullName: string;
    phone: string;
    designation: string;
    regions: string[];
    cities: string[];
    address: string;
    availabilityStatus: "Available" | "Busy" | "On Leave" | "Training" | "Inactive";
    employmentStatus: "Onboarding" | "Active" | "Suspended" | "Deactivated" | "Soft Deleted";
    profilePhoto?: string;
  }
) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify caller is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  // 1. Update profiles table
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      phone_number: data.phone,
      address: data.address,
    })
    .eq("id", omId);

  if (profileErr) throw new Error(profileErr.message);

  // 2. Update operational_managers table
  const { error: metadataErr } = await supabase
    .from("operational_managers")
    .update({
      designation: data.designation,
      assigned_regions: data.regions,
      assigned_cities: data.cities,
      availability_status: data.availabilityStatus,
      employment_status: data.employmentStatus,
      profile_photo: data.profilePhoto,
    })
    .eq("id", omId);

  if (metadataErr) throw new Error(metadataErr.message);

  // 3. Log audit records based on status transitions
  await logAuditRecord("Operational Manager Updated", "operational_manager", omId, data);

  revalidatePath("/admin/operational-managers");
  revalidatePath(`/admin/operational-managers/${omId}`);
  return { success: true };
}

export async function updateOMEmploymentStatus(
  omId: string,
  status: "Onboarding" | "Active" | "Suspended" | "Deactivated" | "Soft Deleted"
) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify caller is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("operational_managers")
    .update({ employment_status: status })
    .eq("id", omId);

  if (error) throw new Error(error.message);

  let auditAction = "Operational Manager Updated";
  if (status === "Active") auditAction = "Operational Manager Activated";
  else if (status === "Suspended") auditAction = "Operational Manager Suspended";
  else if (status === "Deactivated") auditAction = "Operational Manager Deactivated";
  else if (status === "Soft Deleted") auditAction = "Operational Manager Removed";

  await logAuditRecord(auditAction, "operational_manager", omId, { status });

  revalidatePath("/admin/operational-managers");
  return { success: true };
}

export async function resetOMPassword(omId: string, email: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify caller is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const hostHeaders = await headers();
  
  // Robust origin resolution for Server Actions
  let origin = "";
  const referer = hostHeaders.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      origin = url.origin;
    } catch {
      // ignore parsing error
    }
  }
  
  if (!origin) {
    const host = hostHeaders.get("x-forwarded-host") || hostHeaders.get("host");
    if (host) {
      const proto = hostHeaders.get("x-forwarded-proto") || "http";
      origin = `${proto}://${host}`;
    }
  }
  
  if (!origin) {
    origin = hostHeaders.get("origin") || "http://localhost:3000";
  }

  // Trigger Supabase Auth Password Reset Email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) throw new Error(error.message);

  await logAuditRecord("Operational Manager Password Reset", "operational_manager", omId, { email });

  return { success: true };
}
