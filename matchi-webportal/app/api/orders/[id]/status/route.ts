import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const status = String(body.status || "");
  const allowed = ["new", "confirmed", "shipped", "cancelled"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await updateOrderStatus(Number(id), status);
  return NextResponse.json({ ok: true });
}
