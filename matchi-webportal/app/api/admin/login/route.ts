import { NextRequest, NextResponse } from "next/server";
import { checkPassword, makeSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { BASE_PATH } from "@/lib/basePath";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const password = String(body.password || "");

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = makeSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // Scoped to this app's own path so the cookie never leaks to other
    // solutions sharing the zcube.com.au domain.
    path: BASE_PATH || "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
