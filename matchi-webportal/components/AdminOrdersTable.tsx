"use client";

import { useState } from "react";
import type { OrderItemRecord, OrderRecord } from "@/lib/db";
import { withBasePath } from "@/lib/basePath";

type OrderWithItems = OrderRecord & { items: OrderItemRecord[] };

const STATUS_OPTIONS = ["new", "confirmed", "shipped", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  confirmed: "bg-amber-100 text-amber-700",
  shipped: "bg-green-100 text-green-700",
  cancelled: "bg-neutral-200 text-neutral-600",
};

export default function AdminOrdersTable({
  orders,
}: {
  orders: OrderWithItems[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [localOrders, setLocalOrders] = useState(orders);

  async function updateStatus(orderId: number, status: string) {
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    await fetch(withBasePath(`/api/orders/${orderId}/status`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  if (localOrders.length === 0) {
    return <p className="text-neutral-500 text-sm">No orders yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {localOrders.map((order) => {
        const isOpen = expanded === order.id;
        return (
          <div
            key={order.id}
            className="border border-neutral-200 rounded-lg bg-white overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-medium text-sm">#{order.id}</span>
                <span className="text-sm text-neutral-700 truncate">
                  {order.company_name}
                </span>
                <span className="text-xs text-neutral-400 hidden sm:inline">
                  {order.contact_name} · {order.email}
                </span>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-xs text-neutral-400">
                  {new Date(order.created_at).toLocaleString()}
                </span>
                <span className="font-medium text-sm">
                  ${order.total.toFixed(2)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    STATUS_COLORS[order.status] || "bg-neutral-100"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-neutral-200 px-4 py-3 bg-neutral-50">
                <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-neutral-400 text-xs mb-1">Contact</div>
                    <div>{order.contact_name}</div>
                    <div>{order.email}</div>
                    {order.phone && <div>{order.phone}</div>}
                  </div>
                  <div>
                    <div className="text-neutral-400 text-xs mb-1">
                      Delivery Address
                    </div>
                    <div>{order.address || "—"}</div>
                  </div>
                </div>
                {order.notes && (
                  <div className="mb-4 text-sm">
                    <div className="text-neutral-400 text-xs mb-1">Notes</div>
                    <div>{order.notes}</div>
                  </div>
                )}

                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="text-left text-neutral-400 text-xs">
                      <th className="pb-1">SKU</th>
                      <th className="pb-1">Product</th>
                      <th className="pb-1 text-right">Qty</th>
                      <th className="pb-1 text-right">Unit</th>
                      <th className="pb-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t border-neutral-200">
                        <td className="py-1">{item.sku}</td>
                        <td className="py-1">{item.product_name}</td>
                        <td className="py-1 text-right">{item.quantity}</td>
                        <td className="py-1 text-right">
                          ${item.unit_price.toFixed(2)}
                        </td>
                        <td className="py-1 text-right">
                          ${item.line_total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Status:</span>
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(order.id, status)}
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        order.status === status
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-300 text-neutral-600"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
