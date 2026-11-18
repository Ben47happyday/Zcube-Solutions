"use client";

import { useMemo, useState } from "react";
import { products, categories, shapes, sizes, priceBounds } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const ALL = "All";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState(ALL);
  const [shape, setShape] = useState(ALL);
  const [size, setSize] = useState(ALL);
  const [minPrice, setMinPrice] = useState(Math.floor(priceBounds.min));
  const [maxPrice, setMaxPrice] = useState(Math.ceil(priceBounds.max));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q))
        return false;
      if (category !== ALL && p.category !== category) return false;
      if (shape !== ALL && p.shape !== shape) return false;
      if (size !== ALL && p.sizeCm !== size) return false;
      if (p.ondemandPrice < minPrice || p.ondemandPrice > maxPrice) return false;
      return true;
    });
  }, [query, category, shape, size, minPrice, maxPrice]);

  function resetFilters() {
    setCategory(ALL);
    setShape(ALL);
    setSize(ALL);
    setMinPrice(Math.floor(priceBounds.min));
    setMaxPrice(Math.ceil(priceBounds.max));
  }

  const filtersActive =
    category !== ALL ||
    shape !== ALL ||
    size !== ALL ||
    minPrice !== Math.floor(priceBounds.min) ||
    maxPrice !== Math.ceil(priceBounds.max);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {products.length} products available for ondemand wholesale order.
        </p>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or SKU..."
          className="w-full md:w-96 border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <div className="flex items-center gap-3 md:ml-auto">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`px-3 py-2 text-sm font-medium rounded-md border ${
              filtersActive
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700"
            }`}
          >
            Filters{filtersActive ? " •" : ""}
          </button>
          <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden flex-shrink-0">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-2 text-sm font-medium ${
                view === "grid" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 text-sm font-medium ${
                view === "list" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="mb-6 border border-neutral-200 rounded-lg bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Design Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value={ALL}>All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Shape</label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value={ALL}>All shapes</option>
              {shapes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Size (cm)</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value={ALL}>All sizes</option>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Min price</label>
            <input
              type="number"
              min={Math.floor(priceBounds.min)}
              max={maxPrice}
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
              className="w-full border border-neutral-300 rounded-md px-2 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Max price</label>
            <input
              type="number"
              min={minPrice}
              max={Math.ceil(priceBounds.max)}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
              className="w-full border border-neutral-300 rounded-md px-2 py-1.5 text-sm"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 underline"
            >
              Reset filters
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-500 mb-3">{filtered.length} results</p>

      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.sku} product={product} view="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.sku} product={product} view="list" />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-neutral-500 text-sm mt-10 text-center">
          No products match your search or filters.
        </p>
      )}
    </div>
  );
}
