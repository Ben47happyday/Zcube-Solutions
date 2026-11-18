"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({
  product,
  view = "grid",
}: {
  product: Product;
  view?: "grid" | "list";
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const addButton = (
    <button
      onClick={handleAdd}
      className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
        added
          ? "bg-green-600 text-white"
          : "bg-neutral-900 text-white hover:bg-neutral-700"
      }`}
    >
      {added ? "Added" : "Add"}
    </button>
  );

  if (view === "list") {
    return (
      <Link
        href={`/product/${product.sku}`}
        className="group border border-neutral-200 rounded-lg bg-white flex items-center gap-4 p-3 transition-all duration-200 hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5"
      >
        <div className="relative w-24 h-24 flex-shrink-0 bg-neutral-100 rounded overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="96px"
            className="object-contain transition-transform duration-300 ease-out group-hover:scale-110"
          />
          {product.isNew && (
            <span className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
              NEW
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight truncate">{product.name}</h3>
          <p className="text-xs text-neutral-500">
            {product.sku} · {product.sizeCm} cm
          </p>
          <p className="text-xs text-neutral-500">
            Retail: ${product.retailMin} - ${product.retailMax}
          </p>
        </div>
        <div className="text-right">
          <div className="font-semibold">${product.ondemandPrice.toFixed(2)}</div>
          <div className="text-[11px] text-neutral-500">Min order {product.minOrder}</div>
        </div>
        {addButton}
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${product.sku}`}
      className="group border border-neutral-200 rounded-lg overflow-hidden bg-white flex flex-col transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1.5 hover:border-neutral-300"
    >
      <div className="relative aspect-square bg-neutral-100 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded">
            NEW
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-medium text-sm leading-tight">{product.name}</h3>
        <p className="text-xs text-neutral-500">
          {product.sku} · {product.sizeCm} cm
        </p>
        <p className="text-xs text-neutral-500">
          Retail: ${product.retailMin} - ${product.retailMax}
        </p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div>
            <div className="font-semibold">${product.ondemandPrice.toFixed(2)}</div>
            <div className="text-[11px] text-neutral-500">
              Min order {product.minOrder}
            </div>
          </div>
          {addButton}
        </div>
      </div>
    </Link>
  );
}
