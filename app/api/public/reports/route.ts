// app/api/public/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filter = url.searchParams.get("filter") || "latest";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    let query = supabase
      .from("reports")
      .select(`
        *,
        profiles:user_id(username, full_name)
      `);
    
    // Apply filter
    if (filter === "latest") {
      query = query.order("created_at", { ascending: false });
    } else if (filter === "popular") {
      // For popular reports, we'll need to count likes first
      // Get reports sorted by created_at first
      const { data: allReports, error: reportsError } = await supabase
        .from("reports")
        .select(`
          *,
          profiles:user_id(username, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (reportsError) throw reportsError;
      
      // Now count likes for each report
      const reportsWithLikes = await Promise.all(
        allReports.map(async (report) => {
          const { count, error: countError } = await supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("report_id", report.id);
            
          if (countError) throw countError;
          
          return {
            ...report,
            likes_count: count || 0
          };
        })
      );
      
      // Sort by likes count and return
      const sortedReports = reportsWithLikes
        .sort((a, b) => b.likes_count - a.likes_count)
        .slice(0, limit);
        
      return NextResponse.json(sortedReports);
    } else if (filter === "resolved") {
      query = query
        .eq("status", "resolved")
        .order("created_at", { ascending: false });
    }
    
    // Apply limit
    query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching public reports:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data laporan" },
      { status: 500 }
    );
  }
}