"use client";

import { useState, useEffect } from "react";
import { SendIcon, RefreshCw } from "lucide-react";
import CommentItem from "./CommentItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id?: string;
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
  }, [reportId]);

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
        { ...data, replies: [] },
        ...prev
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
      
      // Recursive function to add reply to the correct nested level
      const addReplyToComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            // If this is the direct parent, add the reply
            return {
              ...comment,
              replies: [...(comment.replies || []), data]
            };
          }
          
          // If this comment has replies, recursively search through them
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies)
            };
          }
          
          return comment;
        });
      };

      // Update the entire comments structure
      setComments(addReplyToComment(comments));
      
      return true;
    } catch (error) {
      console.error("Error adding reply:", error);
      return false;
    }
  };

  const renderCommentSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            Diskusi
            {comments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {comments.length}
              </Badge>
            )}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchComments}
                  disabled={loading}
                >
                  <RefreshCw 
                    className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Muat ulang komentar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {/* Comment input */}
        <form onSubmit={handleSubmitComment} className="mb-6 flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tambahkan komentar..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            size="icon"
            variant="default"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>

        {/* Error handling */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {loading ? (
            renderCommentSkeleton()
          ) : comments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Belum ada komentar. Jadilah yang pertama mengomentari.
              </p>
            </div>
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
      </CardContent>
    </Card>
  );
}