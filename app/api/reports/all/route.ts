import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Middleware untuk mendapatkan user yang login
async function getUser(req: NextRequest) {
  const accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  const cookieToken = req.cookies.get("sb-access-token")?.value;
  const token = accessToken || cookieToken;
  
  if (!token) return null;
  
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  
  return data.user;
}

// Ubah ekspor ke GET
export async function GET(req: NextRequest) {
    try {
      const user = await getUser(req);
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
      // Ambil semua laporan dengan informasi profil pembuat
      const { data: reports, error } = await supabase
        .from("reports")
        .select("*, profiles(username, full_name, dapil)")
        .order("created_at", { ascending: false });
  
      if (error) throw error;
  
      return NextResponse.json(reports);
    } catch (err) {
      return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
    }
}
