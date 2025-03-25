"use client";
import { useEffect, useState } from "react";

interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
}

export default function DPRDDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/reports");

        if (!res.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await res.json();
        setReports(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, []);

  async function updateStatus(id: string, status: string) {
    setLoadingId(id); // Tandai laporan yang sedang diupdate
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update status");
      }

      // Pastikan data terbaru digunakan dengan functional update
      setReports((prevReports) =>
        prevReports.map((r) => (r.id === id ? { ...r, status } : r))
      );

      alert("Status berhasil diperbarui!");
    } catch (err : any) {
      console.error("Error updating status:", err);
      alert(`Gagal memperbarui status: ${err.message}`);
    } finally {
      setLoadingId(null); // Reset loading setelah selesai
    }
  }

  if (isLoading) {
    return <div className="max-w-3xl mx-auto mt-10">Loading reports...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold">Dashboard DPRD - Laporan Masyarakat</h2>
      {reports.length === 0 ? (
        <p className="my-4">Belum ada laporan yang tersedia.</p>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="p-4 border rounded my-2 flex justify-between items-center">
            <div>
              <h3 className="font-bold">{report.title}</h3>
              <p>{report.description}</p>
              <p className="text-sm text-gray-500">Status: {report.status}</p>
            </div>
            <select
              className="border p-2 rounded"
              value={report.status}
              onChange={(e) => updateStatus(report.id, e.target.value)}
              disabled={loadingId === report.id} // Nonaktifkan saat loading
            >
              <option value="pending">Pending</option>
              <option value="process">Diproses</option>
              <option value="completed">Selesai</option>
            </select>
            {loadingId === report.id && <span className="ml-2 text-blue-500">Updating...</span>}
          </div>
        ))
      )}
    </div>
  );
}
