"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/products";

export type CartLine = {
  sku: string;
  name: string;
  image: string;
  unitPrice: number;
  minOrder: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "heymat_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore
    }
  }, [lines, hydrated]);

  const addToCart = useCallback((product: Product, quantity?: number) => {
    const qty = quantity ?? product.minOrder;
    setLines((prev) => {
      const existing = prev.find((l) => l.sku === product.sku);
      if (existing) {
        return prev.map((l) =>
          l.sku === product.sku ? { ...l, quantity: l.quantity + qty } : l
        );
      }
      return [
        ...prev,
        {
          sku: product.sku,
          name: product.name,
          image: product.image,
          unitPrice: product.ondemandPrice,
          minOrder: product.minOrder,
          quantity: qty,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((sku: string, quantity: number) => {
    setLines((prev) =>
      prev.map((l) => (l.sku === sku ? { ...l, quantity } : l))
    );
  }, []);

  const removeFromCart = useCallback((sku: string) => {
    setLines((prev) => prev.filter((l) => l.sku !== sku));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const totalItems = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );
  const totalAmount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    [lines]
  );

  const value: CartContextValue = {
    lines,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
