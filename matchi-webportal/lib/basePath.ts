// next/link and next/image auto-prefix with Next's basePath, but a plain
// fetch("/api/...") string does not — this covers those call sites.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
