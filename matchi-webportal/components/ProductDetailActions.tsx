"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export default function ProductDetailActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(product.minOrder);
  const [added, setAdded] = useState(false);

  function clamp(q: number) {
    return Math.max(product.minOrder, q);
  }

  function handleAdd() {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-500">Quantity</span>
        <div className="flex items-center border border-neutral-300 rounded-md">
          <button
            onClick={() => setQuantity((q) => clamp(q - 1))}
            className="w-8 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min={product.minOrder}
            value={quantity}
            onChange={(e) => setQuantity(clamp(Number(e.target.value) || product.minOrder))}
            className="w-14 text-center border-x border-neutral-300 py-1.5 text-sm"
          />
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-8 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="text-xs text-neutral-500">Min order {product.minOrder}</span>
      </div>

      <button
        onClick={handleAdd}
        className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
          added ? "bg-green-600 text-white" : "bg-neutral-900 text-white hover:bg-neutral-700"
        }`}
      >
        {added ? "Added to cart" : `Add ${quantity} to cart`}
      </button>
    </div>
  );
}
