import crypto from "crypto";

const COOKIE_NAME = "heymat_admin";

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || "changeme";
}

function sign(value: string): string {
  const h = crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${h}`;
}

export function makeSessionToken(): string {
  const payload = `admin:${Date.now()}`;
  return sign(payload);
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx === -1) return false;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  return password === getSecret();
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
