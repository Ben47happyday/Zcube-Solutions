"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function SiteHeader() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-wide">
          HEYMAT <span className="text-neutral-400 font-normal text-sm">Wholesale</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="hover:text-neutral-600">
            Catalog
          </Link>
          <Link href="/cart" className="relative hover:text-neutral-600">
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-4 bg-neutral-900 text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
