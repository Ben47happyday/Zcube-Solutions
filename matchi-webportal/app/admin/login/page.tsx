"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { withBasePath } from "@/lib/basePath";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch(withBasePath("/api/admin/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-xl font-semibold mb-6 text-center">Admin Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-neutral-900 text-white px-4 py-2.5 rounded-md text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Checking..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
