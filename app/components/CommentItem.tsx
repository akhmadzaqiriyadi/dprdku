// components/CommentItem.tsx
"use client";

import { useState } from "react";
import { FaReply } from "react-icons/fa";

interface CommentProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
      full_name: string;
    };
    replies?: any[];
  };
  onAddReply: (parentId: string, content: string) => Promise<boolean>;
}

export default function CommentItem({ comment, onAddReply }: CommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  return (
    <div className="border-l-2 border-gray-200 pl-3">
      {/* Comment */}
      <div className="mb-2">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
            {comment.profiles.username ? comment.profiles.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {comment.profiles.full_name || comment.profiles.username}
            </p>
            <p className="text-gray-700">{comment.content}</p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span>{formatDate(comment.created_at)}</span>
              <button 
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="ml-3 flex items-center text-blue-500 hover:text-blue-700"
              >
                <FaReply className="mr-1" />
                <span>Balas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply form */}
      {showReplyInput && (
        <form onSubmit={handleReplySubmit} className="ml-10 mb-3">
          <div className="flex">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Tulis balasan..."
              className="flex-1 border rounded-l p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting || !replyContent.trim()}
              className="bg-blue-500 text-white px-2 py-1 text-sm rounded-r hover:bg-blue-600 disabled:bg-blue-300"
            >
              Kirim
            </button>
          </div>
        </form>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="border-l-2 border-gray-100 pl-3">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-2 text-xs">
                  {reply.profiles.username ? reply.profiles.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {reply.profiles.full_name || reply.profiles.username}
                  </p>
                  <p className="text-gray-700 text-sm">{reply.content}</p>
                  <p className="text-xs text-gray-500">{formatDate(reply.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}