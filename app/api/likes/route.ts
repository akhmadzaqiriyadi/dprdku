import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to authenticate user
async function getUser(req: NextRequest) {
  const accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  const cookieToken = req.cookies.get("sb-access-token")?.value;

  const token = accessToken || cookieToken;
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user;
}

// Toggle like status (add or remove)
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { report_id } = await req.json();
    if (!report_id) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("report_id", report_id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking like:", checkError);
      return NextResponse.json({ error: "Failed to check like status" }, { status: 500 });
    }

    // If liked, remove like (unlike)
    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (unlikeError) {
        console.error("Error unliking:", unlikeError);
        return NextResponse.json({ error: "Failed to unlike" }, { status: 500 });
      }

      return NextResponse.json({ liked: false, message: "Report unliked successfully" });
    }

    // If not liked, add like
    const { data: newLike, error: likeError } = await supabase
      .from("likes")
      .insert([{ user_id: user.id, report_id }])
      .select()
      .single();

    if (likeError) {
      console.error("Error liking:", likeError);
      return NextResponse.json({ error: "Failed to like report" }, { status: 500 });
    }

    return NextResponse.json({ liked: true, message: "Report liked successfully", data: newLike });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Get likes count for a report
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const reportId = url.searchParams.get("report_id");

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    // Get total likes count
    const { count, error: countError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("report_id", reportId);

    if (countError) {
      console.error("Error counting likes:", countError);
      return NextResponse.json({ error: "Failed to get likes count" }, { status: 500 });
    }

    // Check if user liked this report
    const { data: userLike, error: likeError } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("report_id", reportId)
      .maybeSingle();

    if (likeError) {
      console.error("Error checking user like:", likeError);
      return NextResponse.json({ error: "Failed to check like status" }, { status: 500 });
    }

    return NextResponse.json({
      count: count || 0,
      userLiked: !!userLike
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}