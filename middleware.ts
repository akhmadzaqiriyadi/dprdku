import { NextRequest, NextResponse } from "next/server";


export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("sb-access-token")?.value;

  // Jika tidak ada token, redirect ke login
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Ambil user dari Supabase menggunakan REST API
  const userRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
  });

  const userData = await userRes.json();

  if (!userRes.ok || !userData) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userId = userData.id;

  // Ambil role pengguna dari tabel profiles
  const profileRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
  });

  const profileData = await profileRes.json();
  if (!profileRes.ok || profileData.length === 0) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = profileData[0].role;
  const path = req.nextUrl.pathname;

  // Atur akses berdasarkan role
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (path.startsWith("/dprd") && role !== "dprd") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Tentukan rute mana yang akan melewati middleware
export const config = {
  matcher: ["/admin/:path*", "/dprd/:path*", "/dashboard/:path*"],
};
