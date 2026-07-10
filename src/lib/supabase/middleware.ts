import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(
    supabaseUrl,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Retrieve user session (verifies cookie authenticity securely)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role || null;
  }

  // Admin routing isolation: once authenticated as admin, must stay inside /admin/*
  if (user && role === "admin" && !path.startsWith("/admin")) {
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect /admin base route directly to dashboard
  if (path === "/admin" || path === "/admin/") {
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  const isProtectedPath =
    path.startsWith("/admin") ||
    path.startsWith("/customer") ||
    path.startsWith("/vendor") ||
    path.startsWith("/operations") ||
    path.startsWith("/update-password");
  
  const isAuthPath = 
    path.startsWith("/login") || 
    path.startsWith("/register") || 
    path.startsWith("/forgot-password");

  if (isProtectedPath) {
    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/admin") && role !== "admin") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/customer") && role !== "customer") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/vendor") && role !== "vendor") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/operations") && role !== "operational_manager") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    // Check operational manager constraints (lock & password change)
    if (role === "operational_manager") {
      const { data: om, error: omError } = await supabase
        .from("operational_managers")
        .select("employment_status, requires_password_change")
        .eq("id", user.id)
        .single();
      
      const requiresPasswordChange = (!omError && om) ? (om.requires_password_change ?? false) : false;
      const employmentStatus = (!omError && om) ? (om.employment_status ?? "Onboarding") : "Active";

      // 1. Force password change first if required
      if (requiresPasswordChange && path !== "/update-password") {
        url.pathname = "/update-password";
        return NextResponse.redirect(url);
      }

      // 2. Lock check: if status is not Active, redirect to locked page
      if (!requiresPasswordChange && employmentStatus !== "Active" && path !== "/operations/locked") {
        url.pathname = "/operations/locked";
        return NextResponse.redirect(url);
      }

      // 3. Prevent accessing /operations/locked if account IS Active
      if (employmentStatus === "Active" && path === "/operations/locked") {
        url.pathname = "/operations/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  // Redirect authenticated users trying to hit auth forms
  if (isAuthPath && user) {
    if (role === "admin") {
      url.pathname = "/admin/dashboard";
    } else if (role === "vendor") {
      url.pathname = "/vendor/profile";
    } else if (role === "operational_manager") {
      url.pathname = "/operations";
    } else {
      url.pathname = "/customer/profile";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
