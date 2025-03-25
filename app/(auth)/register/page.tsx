"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const dapilData = [
  { kabupaten: "Kabupaten Banjarnegara", dapil: "Banjarnegara 1" },
  { kabupaten: "Kabupaten Banjarnegara", dapil: "Banjarnegara 2" },
  { kabupaten: "Kabupaten Banjarnegara", dapil: "Banjarnegara 3" },
  { kabupaten: "Kabupaten Banjarnegara", dapil: "Banjarnegara 4" },
  { kabupaten: "Kabupaten Banyumas", dapil: "Banyumas 1" },
  { kabupaten: "Kabupaten Banyumas", dapil: "Banyumas 2" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
    dapil: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectDapil = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, dapil: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password, fullName, username, dapil } = form;

    // Register user di Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Simpan user ke tabel profiles
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          full_name: fullName,
          username,
          dapil,
          role: "masyarakat", // Default sebagai masyarakat
        },
      ]);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      router.push("/login");
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Daftar DPRDku</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Nama Lengkap"
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          
          {/* Dropdown untuk memilih Dapil */}
          <select
            name="dapil"
            value={form.dapil}
            onChange={handleSelectDapil}
            required
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>
              Pilih Dapil (Daerah Pemilihan)
            </option>
            {dapilData.map((item, index) => (
              <option key={index} value={item.dapil}>
                {item.dapil} ({item.kabupaten})
              </option>
            ))}
          </select>

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}
