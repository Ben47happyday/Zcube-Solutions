"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { withBasePath } from "@/lib/basePath";

export default function CheckoutPage() {
  const { lines, totalAmount, clearCart } = useCart();
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
        <Link href="/" className="text-neutral-700 underline text-sm">
          Go back to catalog
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(withBasePath("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactName,
          email,
          phone,
          address,
          notes,
          items: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/order-confirmation/${data.orderId}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-3 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name *</label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Name *</label>
            <input
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-neutral-900 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-neutral-700 disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <div className="md:col-span-2">
          <div className="border border-neutral-200 rounded-lg p-4 bg-white sticky top-20">
            <h2 className="font-medium mb-3 text-sm">Order Summary</h2>
            <div className="flex flex-col gap-2 text-sm">
              {lines.map((l) => (
                <div key={l.sku} className="flex justify-between gap-2">
                  <span className="truncate">
                    {l.name} × {l.quantity}
                  </span>
                  <span className="flex-shrink-0">
                    ${(l.unitPrice * l.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 mt-3 pt-3 flex justify-between font-semibold text-sm">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
