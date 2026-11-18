import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import { BASE_PATH } from "@/lib/basePath";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { path: BASE_PATH || "/", maxAge: 0 });
  return res;
}
