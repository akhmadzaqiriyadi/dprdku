"use client";

import { useState } from "react";
import { Reply, Send, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface CommentItemProps {
  comment: Comment;
  onAddReply: (parentId: string, content: string) => Promise<boolean>;
  depth?: number;
}

export default function CommentItem({ 
  comment, 
  onAddReply, 
  depth = 0 
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Format date relative to now (e.g. "5 minutes ago")
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: id 
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || submitting) return;
    
    setSubmitting(true);
    const success = await onAddReply(comment.id, replyContent);
    
    if (success) {
      setReplyContent("");
      setShowReplyInput(false);
    }
    
    setSubmitting(false);
  };

  // Get initials for avatar
  const getInitials = () => {
    if (comment.profiles.full_name) {
      return comment.profiles.full_name
        .split(' ')
        .slice(0, 2)
        .map(name => name.charAt(0).toUpperCase())
        .join('');
    }
    return comment.profiles.username.charAt(0).toUpperCase();
  };

  // Limit nesting to 3 levels
  const maxDepth = 3;
  const canReply = depth < maxDepth;

  return (
    <div className={depth > 0 ? 'ml-6' : ''}>
      <Card className="p-3 shadow-sm">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          {/* Comment content */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {comment.profiles.full_name || comment.profiles.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Laporkan</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="text-sm">{comment.content}</p>
            
            {/* Reply button */}
            {canReply && (
              <div className="pt-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => setShowReplyInput(!showReplyInput)}
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Balas
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Balas komentar ini</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Reply form */}
      {showReplyInput && (
        <div className="mt-2 ml-6">
          <form onSubmit={handleReplySubmit} className="flex gap-2">
            <Input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Tulis balasan..."
              className="flex-1 text-sm h-9"
              disabled={submitting}
            />
            <Button
              type="submit"
              disabled={submitting || !replyContent.trim()}
              size="sm"
              className="h-9"
            >
              <Send className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              onClick={() => setShowReplyInput(false)}
              variant="outline"
              size="sm"
              className="h-9"
            >
              Batal
            </Button>
          </form>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2 border-l-2 border-primary/10 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onAddReply={onAddReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}