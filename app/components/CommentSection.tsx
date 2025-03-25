"use client";

import { useState, useEffect } from "react";
import CommentItem from "./CommentItem";
import { FaPaperPlane } from "react-icons/fa";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  reportId: string;
}

export default function CommentSection({ reportId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments?report_id=${reportId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Gagal memuat komentar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          report_id: reportId, 
          content: newComment 
        }),
      });

      if (!response.ok) throw new Error("Failed to add comment");
      
      const { data } = await response.json();
      
      // Add the new comment to the list
      setComments(prev => [
        ...prev,
        { ...data, replies: [] }
      ]);
      
      // Clear the input
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Gagal menambahkan komentar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: string, content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          report_id: reportId, 
          content,
          parent_id: parentId
        }),
      });

      if (!response.ok) throw new Error("Failed to add reply");
      
      const { data } = await response.json();
      
      // Update comments with the new reply
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data]
            };
          }
          return comment;
        })
      );
      
      return true;
    } catch (error) {
      console.error("Error adding reply:", error);
      return false;
    }
  };

  return (
    <div className="mt-4 pt-2">
      {/* Comment input */}
      <form onSubmit={handleSubmitComment} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tambahkan komentar..."
            className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            <FaPaperPlane />
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-500">Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada komentar.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onAddReply={handleAddReply}
            />
          ))
        )}
      </div>
    </div>
  );
}