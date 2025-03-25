"use client";

import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";
import CommentSection from "./CommentSection";

interface ReportProps {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  created_at: string;
  status: string;
  user?: {
    username: string;
    full_name: string;
  };
}

export default function ReportItem({ 
  id, 
  title, 
  description, 
  category, 
  image_url, 
  created_at, 
  status, 
  user 
}: ReportProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch likes data when component mounts
  useEffect(() => {
    fetchLikesData();
  }, []);

  const fetchLikesData = async () => {
    try {
      const response = await fetch(`/api/likes?report_id=${id}`);
      if (!response.ok) throw new Error("Failed to fetch likes data");
      
      const data = await response.json();
      setLiked(data.userLiked);
      setLikesCount(data.count);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleLikeToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ report_id: id }),
      });

      if (!response.ok) throw new Error("Failed to toggle like");
      
      const data = await response.json();
      setLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Function to translate status
  const translateStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'in_progress':
        return 'Sedang Diproses';
      case 'resolved':
        return 'Selesai';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-md bg-white mb-4">
      {/* Report author info */}
      {user && (
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex-1">
            <p className="font-medium">{user.full_name || user.username}</p>
            <span 
              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}
            >
              {translateStatus(status)}
            </span>
          </div>
        </div>
      )}

      {/* Report content */}
      {image_url && (
        <img
          src={image_url}
          alt={title}
          className="w-full h-48 object-cover rounded-md mb-2"
        />
      )}

      {/* Menampilkan waktu laporan */}
      <p className="text-sm text-gray-400 mt-1">
        Dibuat pada {new Date(created_at).toLocaleString("id-ID")}
      </p>
      
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 mb-2">{description}</p>
      
      <div className="text-sm text-gray-500 mb-2">
        <span className="bg-gray-100 px-2 py-1 rounded-full">
          {category}
        </span>
      </div>

      {/* Report actions */}
      <div className="mt-4 pt-3 border-t flex items-center">
        <button 
          onClick={handleLikeToggle}
          className="flex items-center mr-4 text-gray-600 hover:text-gray-800"
          disabled={loading}
        >
          {liked ? (
            <FaHeart className="text-red-500 mr-1" />
          ) : (
            <FaRegHeart className="mr-1" />
          )}
          <span>{likesCount} {likesCount === 1 ? "Suka" : "Suka"}</span>
        </button>

        <button 
          onClick={toggleComments}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FaComment className="mr-1" />
          <span>Komentar</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && <CommentSection reportId={id} />}
    </div>
  );
}