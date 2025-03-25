"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Define the type for a report
type Report = {
  id: number;
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

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Memuat laporan...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Laporan</h1>
        <a 
          href="/dashboard/reports/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Buat Laporan Baru
        </a>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Belum ada laporan</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div 
              key={report.id} 
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">{report.title}</h2>
                <span 
                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}
                >
                  {translateStatus(report.status)}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <span>Oleh {report.profiles.full_name}</span>
                <span className="mx-2">•</span>
                <span>{format(new Date(report.created_at), 'dd MMMM yyyy')}</span>
              </div>
              
              <p className="text-gray-700 mb-2 line-clamp-2">{report.description}</p>
              
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded-full">
                  {report.category}
                </span>
              </div>
              
              {report.image_url && (
                <div className="mt-4">
                  <img 
                    src={report.image_url} 
                    alt={report.title} 
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}