"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { withBasePath } from "@/lib/basePath";

export default function CartPage() {
  const { lines, updateQuantity, removeFromCart, totalAmount } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-neutral-500 mb-6">
          Browse the catalog and add products to get started.
        </p>
        <Link
          href="/"
          className="inline-block bg-neutral-900 text-white px-5 py-2.5 rounded-md text-sm font-medium"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Your Cart</h1>
      <div className="flex flex-col gap-4">
        {lines.map((line) => (
          <div
            key={line.sku}
            className="flex items-center gap-4 border border-neutral-200 rounded-lg p-3 bg-white"
          >
            <div className="relative w-16 h-16 flex-shrink-0 bg-neutral-100 rounded overflow-hidden">
              <Image src={withBasePath(line.image)} alt={line.name} fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{line.name}</div>
              <div className="text-xs text-neutral-500">
                {line.sku} · ${line.unitPrice.toFixed(2)} each · min {line.minOrder}
              </div>
            </div>
            <input
              type="number"
              min={line.minOrder}
              value={line.quantity}
              onChange={(e) =>
                updateQuantity(
                  line.sku,
                  Math.max(line.minOrder, Number(e.target.value) || line.minOrder)
                )
              }
              className="w-20 border border-neutral-300 rounded-md px-2 py-1 text-sm text-right"
            />
            <div className="w-20 text-right font-medium text-sm">
              ${(line.unitPrice * line.quantity).toFixed(2)}
            </div>
            <button
              onClick={() => removeFromCart(line.sku)}
              className="text-neutral-400 hover:text-red-600 text-sm"
              aria-label="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6">
        <div className="text-lg font-semibold">
          Total: ${totalAmount.toFixed(2)}
        </div>
        <Link
          href="/checkout"
          className="bg-neutral-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-neutral-700"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
