// next/link auto-prefixes with Next's basePath. next/image normally does
// too, but NOT when images.unoptimized is set (next.config.ts) — it then
// renders a plain <img src> with no Next routing involved at all. Along
// with plain fetch("/api/...") strings, those call sites need this.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
