import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

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

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ambil dapil user dari tabel profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dapil")
      .eq("id", user.id)
      .single();

    if (profileError) return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });

    const { title, description, category, image_url } = await req.json();

    // Validasi kategori
    const validCategories = ["aspirasi", "keluhan", "permintaan informasi"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("reports")
      .insert([{ 
        title, 
        description, 
        category, 
        image_url, 
        dapil: profile.dapil, 
        user_id: user.id,
        status: "pending"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Laporan berhasil dibuat", data });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ambil dapil user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dapil")
      .eq("id", user.id)
      .single();

    if (profileError) return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });

    // Ambil laporan berdasarkan dapil user
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*, profiles(username, full_name)")
      .eq("dapil", profile.dapil)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(reports);
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}