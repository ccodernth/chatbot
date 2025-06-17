import React, { useEffect, useState } from "react";

interface Profile {
  name: string;
  email: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Profil alınamadı");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch(console.error);
  }, []);

  if (!profile)
    return (
      <main className="max-w-md mx-auto p-6 text-center text-gray-600">
        Yükleniyor...
      </main>
    );

  return (
    <main className="max-w-md mx-auto p-6 bg-white shadow rounded-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Profil</h1>
      <p className="mb-2">
        <span className="font-semibold">İsim:</span> {profile.name}
      </p>
      <p>
        <span className="font-semibold">Email:</span> {profile.email}
      </p>
    </main>
  );
}
