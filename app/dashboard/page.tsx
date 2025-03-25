"use client";
import { useState, useEffect } from 'react';
import ReportItem from '../components/ReportItem';

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
  const [filter, setFilter] = useState({
    category: '',
    status: ''
  });

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
    (!filter.category || report.category === filter.category) &&
    (!filter.status || report.status === filter.status)
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Memuat laporan...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Laporan</h1>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select 
          value={filter.category}
          onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
          className="px-3 py-2 border rounded"
        >
          <option value="">Semua Kategori</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border rounded"
        >
          <option value="">Semua Status</option>
          {statuses.map(status => (
            <option key={status} value={status}>{translateStatus(status)}</option>
          ))}
        </select>
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
    </div>
  );
}