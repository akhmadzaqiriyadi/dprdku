"use client";

import { useState } from "react";

export default function AddPost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validasi input
    if (!title || !description || !imageUrl) {
      setError("Semua field harus diisi!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, image_url: imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menambahkan postingan");
      }

      setSuccess("Postingan berhasil ditambahkan!");
      setTitle("");
      setDescription("");
      setImageUrl("");
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-center mb-4">Tambah Postingan</h2>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {success && <p className="text-green-500 text-sm text-center">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Judul</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="Masukkan judul..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Deskripsi</label>
          <textarea
            className="w-full p-2 border rounded-lg"
            placeholder="Masukkan deskripsi..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">URL Gambar</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="Masukkan URL gambar..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Menambahkan..." : "Tambah Postingan"}
        </button>
      </form>
    </div>
  );
}
