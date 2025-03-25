import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Middleware API untuk cek user
async function getUserRole(req: NextRequest) {
  const accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  const cookieToken = req.cookies.get("sb-access-token")?.value;

  const token = accessToken || cookieToken;
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user;
}

// Handler untuk UPDATE laporan
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // Ambil id dari URL params
    if (!id) {
      return NextResponse.json({ error: "ID laporan tidak ditemukan" }, { status: 400 });
    }

    const { status, title, description, category, image_url } = await req.json();
    const user = await getUserRole(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cek role user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah laporan ada
    const { data: existingReport, error: reportError } = await supabase
      .from("reports")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (reportError || !existingReport) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
    }

    let updateData = {};
    if (profile.role === "dprd") {
      // Jika user DPRD, hanya bisa update status
      updateData = { status };
    } else if (user.id === existingReport.user_id) {
      // Jika user pemilik laporan, hanya bisa update beberapa field
      updateData = { title, description, category, image_url };
    } else {
      return NextResponse.json({ error: "Anda tidak memiliki izin untuk mengedit laporan ini" }, { status: 403 });
    }

    const { data, error: updateError } = await supabase
      .from("reports")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Laporan berhasil diperbarui", data });
  } catch (err) {
    console.error("Error updating report:", err);
    return NextResponse.json({ error: "Terjadi kesalahan saat memperbarui laporan" }, { status: 500 });
  }
}
