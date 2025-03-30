"use client";

import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  // Function to get status variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'resolved':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <Avatar>
          <AvatarFallback>
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{user?.full_name || user?.username}</p>
            <span className="text-sm text-muted-foreground">
              {new Date(created_at).toLocaleString("id-ID")}
            </span>
            </div>
              <Badge variant={getStatusVariant(status)}>
                {translateStatus(status)}
              </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {image_url && (
          <Dialog>
            <DialogTrigger asChild>
              <img
                src={image_url}
                alt={title}
                className="w-full aspect-video object-cover rounded-md mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <img
                src={image_url}
                alt={title}
                className="w-full max-h-[500px] object-contain"
              />
            </DialogContent>
          </Dialog>
        )}

        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        
        <Badge variant="secondary" className="mr-2">
          {category}
        </Badge>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant={liked ? "destructive" : "outline"}
            size="sm"
            onClick={handleLikeToggle}
            disabled={loading}
          >
            {liked ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
            {likesCount} Suka
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <FaComment className="mr-2" />
            Komentar
          </Button>
        </div>
      </CardFooter>

      {showComments && (
        <div className="p-4 border-t">
          <CommentSection reportId={id} />
        </div>
      )}
    </Card>
  );
}