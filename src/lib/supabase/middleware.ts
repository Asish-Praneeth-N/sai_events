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
    path.startsWith("/vendor");
  
  const isAuthPath = path.startsWith("/login") || path.startsWith("/register");

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
  }

  // Redirect authenticated users trying to hit auth forms
  if (isAuthPath && user) {
    if (role === "admin") {
      url.pathname = "/admin/dashboard";
    } else if (role === "vendor") {
      url.pathname = "/vendor/profile";
    } else {
      url.pathname = "/customer/profile";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
