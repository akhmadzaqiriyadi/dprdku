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

// Recursive function to build nested comment structure
function buildCommentTree(comments: any[], parentId: string | null = null): any[] {
  // Filter comments with the current parentId
  const filteredComments = comments.filter(comment => 
    (comment.parent_id === parentId) || 
    (parentId === null && !comment.parent_id)
  );

  // Map through filtered comments and recursively add their replies
  return filteredComments.map(comment => {
    // Find and add nested replies
    const replies = buildCommentTree(comments, comment.id);

    return {
      ...comment,
      replies: replies.length > 0 ? replies : undefined
    };
  });
}

// Get comments for a report
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

    // Get all comments for the report
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          username,
          full_name
        )
      `)
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }

    // Build nested comment tree
    const nestedComments = buildCommentTree(comments);

    return NextResponse.json(nestedComments);
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// Add a new comment
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { report_id, content, parent_id } = await req.json();
    
    if (!report_id || !content) {
      return NextResponse.json({ error: "Report ID and content are required" }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert([{ 
        user_id: user.id, 
        report_id, 
        content,
        parent_id: parent_id || null // For replies
      }])
      .select(`
        *,
        profiles:user_id (
          username,
          full_name
        )
      `)
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Comment added successfully", 
      data: comment 
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// // Get comments for a report
// export async function GET(req: NextRequest) {
//   try {
//     const user = await getUser(req);
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const url = new URL(req.url);
//     const reportId = url.searchParams.get("report_id");

//     if (!reportId) {
//       return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
//     }

//     // Get all comments for the report
//     const { data: comments, error } = await supabase
//       .from("comments")
//       .select(`
//         *,
//         profiles:user_id (
//           username,
//           full_name
//         )
//       `)
//       .eq("report_id", reportId)
//       .order("created_at", { ascending: true });

//     if (error) {
//       console.error("Error fetching comments:", error);
//       return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
//     }

//     // Organize comments into a hierarchical structure (parent comments and their replies)
//     const parentComments = comments.filter(comment => !comment.parent_id);
//     const commentReplies = comments.filter(comment => comment.parent_id);
    
//     // Add replies to their parent comments
//     const commentsWithReplies = parentComments.map(parent => {
//       const replies = commentReplies.filter(reply => reply.parent_id === parent.id);
//       return {
//         ...parent,
//         replies: replies || []
//       };
//     });

//     return NextResponse.json(commentsWithReplies);
//   } catch (err) {
//     console.error("Server error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }