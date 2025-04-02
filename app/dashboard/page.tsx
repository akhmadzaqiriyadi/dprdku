"use client";

import { useState, useEffect } from 'react';
import ReportItem from '../components/ReportItem';
import Navbar from '../components/Navbar';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define the type for a report
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
};

export default function DashboardReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    category: 'all',
    status: 'all'
  });
  const router = useRouter();

  // Check user from cookies
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

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Gagal mengambil laporan');
        }
        
        const data = await response.json();
        setReports(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    Cookies.remove("sb-access-token");
    Cookies.remove("role");
    setUser(null);
    setUserRole(null);
    router.push("/login");
  };

  // Get unique categories and statuses for filtering
  const categories = [...new Set(reports.map(r => r.category))];
  const statuses = [...new Set(reports.map(r => r.status))];

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

  // Filter reports based on selected filters
  const filteredReports = reports.filter(report => 
    (filter.category === 'all' || report.category === filter.category) &&
    (filter.status === 'all' || report.status === filter.status)
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Memuat laporan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} userRole={userRole} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Laporan</h1>

        {/* Enhanced Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="category-filter" className="text-sm font-medium">
              Kategori
            </Label>
            <Select
              value={filter.category}
              onValueChange={(value) => setFilter(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger 
                id="category-filter"
                className="w-full bg-background border border-input hover:border-primary/50 transition-colors"
              >
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-input">
                <SelectItem value="all" className="hover:bg-accent">
                  Semua Kategori
                </SelectItem>
                {categories.map(cat => (
                  <SelectItem 
                    key={cat} 
                    value={cat}
                    className="hover:bg-accent transition-colors"
                  >
                    {cat.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={filter.status}
              onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger 
                id="status-filter"
                className="w-full bg-background border border-input hover:border-primary/50 transition-colors"
              >
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-input">
                <SelectItem value="all" className="hover:bg-accent">
                  Semua Status
                </SelectItem>
                {statuses.map(status => (
                  <SelectItem 
                    key={status} 
                    value={status}
                    className="hover:bg-accent transition-colors"
                  >
                    {translateStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Tidak ada laporan yang sesuai</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <ReportItem 
                key={report.id}
                {...report}
                user={report.profiles}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}