"use client";

import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/basePath";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch(withBasePath("/api/admin/logout"), { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-sm text-neutral-500 underline">
      Log out
    </button>
  );
}
