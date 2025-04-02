"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportItem from "../app/components/ReportItem";
import Navbar from "../app/components/Navbar";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Cookies from "js-cookie";

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Report = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  image_url?: string;
  profiles: {
    username: string;
    full_name: string;
  };
  likes_count?: number;
};

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("latest");
  const router = useRouter();

  // Cek user dari cookie
  useEffect(() => {
    const checkUser = async () => {
      const token = Cookies.get("sb-access-token");
      const role = Cookies.get("role");

      if (token) {
        setUser({ token });
        setUserRole(role || null);
      } else {
        setUser(null);
        setUserRole(null);
      }
    };

    checkUser();
  }, []);

  // Fetch laporan berdasarkan filter tab
  useEffect(() => {
    fetchReports(activeTab);
  }, [activeTab]);

  const fetchReports = async (filter = "latest") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/public/reports?filter=${filter}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleLogout = async () => {
    Cookies.remove("sb-access-token");
    Cookies.remove("role");

    setUser(null);
    setUserRole(null);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar user={user} userRole={userRole} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="mb-8">
          <p className="text-muted-foreground mt-2">
            Platform aspirasi dan laporan masyarakat
          </p>
        </div>

        <Tabs defaultValue="latest" value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="latest">Terbaru</TabsTrigger>
            <TabsTrigger value="popular">Populer</TabsTrigger>
            <TabsTrigger value="resolved">Selesai</TabsTrigger>
          </TabsList>

          {!user && (
            <div className="bg-muted p-6 rounded-lg text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Mau Lapor? Punya Keluhan?</h3>
              <p className="mb-4">Silahkan login terlebih dahulu untuk berpartisipasi!</p>
              <Button onClick={() => router.push("/login")}>Login Sekarang</Button>
            </div>
          )}

          <TabsContent value="latest" className="space-y-4">
            {loading ? <LoadingSpinner /> : <ReportList reports={reports} />}
          </TabsContent>
          
          <TabsContent value="popular" className="space-y-4">
            {loading ? <LoadingSpinner /> : <ReportList reports={reports} />}
          </TabsContent>
          
          <TabsContent value="resolved" className="space-y-4">
            {loading ? <LoadingSpinner /> : <ReportList reports={reports} />}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-muted p-6 mt-auto">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 DPRDku. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/about" className="text-muted-foreground hover:underline">Tentang Kami</Link>
            <Link href="/contact" className="text-muted-foreground hover:underline">Kontak</Link>
            <Link href="/privacy" className="text-muted-foreground hover:underline">Kebijakan Privasi</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const LoadingSpinner = () => (
  <div className="flex justify-center py-12">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const ReportList = ({ reports }: { reports: Report[] }) => (
  reports.length > 0 ? (
    reports.map(report => (
      <ReportItem 
        key={report.id}
        id={report.id}
        title={report.title}
        description={report.description}
        category={report.category}
        image_url={report.image_url}
        created_at={report.created_at}
        status={report.status}
        user={report.profiles}
      />
    ))
  ) : (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Belum ada laporan</p>
    </div>
  )
);
