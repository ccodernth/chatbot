import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error("Kayıt başarısız");
      alert("Kayıt başarılı, giriş yapabilirsiniz");
      navigate("/login");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h1>
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">İsim</span>
          <input
            placeholder="İsim"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                       placeholder-gray-400 focus:border-indigo-500 focus:ring
                       focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Email</span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                       placeholder-gray-400 focus:border-indigo-500 focus:ring
                       focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">Parola</span>
          <input
            type="password"
            placeholder="Parola"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                       placeholder-gray-400 focus:border-indigo-500 focus:ring
                       focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md
                     hover:bg-indigo-700 transition-colors duration-200"
        >
          Kayıt Ol
        </button>
      </form>
    </main>
  );
}
