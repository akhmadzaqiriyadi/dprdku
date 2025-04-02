"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password } = form;

    // 1️⃣ Login ke Supabase tanpa cek email konfirmasi
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setError(error?.message || "Login gagal");
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    // 2️⃣ Ambil role user dari database Supabase
    const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*") // Ambil semua kolom untuk debug
    .eq("id", userId) // Sesuaikan dengan nama kolom ID di Supabase
    .single();
  
  console.log("User ID:", userId); // Debug ID user
  console.log("Profile Data:", profile); // Debug hasil query
  console.log("Profile Error:", profileError); // Debug error query
  

    if (profileError || !profile) {
      setError("Gagal mendapatkan role pengguna");
      setLoading(false);
      return;
    }

    const role = profile.role;
    const username = profile.username || ""; 

    // 3️⃣ Simpan token dan role di cookie
    Cookies.set("sb-access-token", data.session?.access_token || "", { path: "/" });
    Cookies.set("username", username, { path: "/" });
    Cookies.set("role", role, { path: "/" });

    // 4️⃣ Redirect berdasarkan role
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "dprd") {
      router.push("/dprd/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login DPRDku</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? "Masuk..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
