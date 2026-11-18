import Link from "next/link";
import { getOrderWithItems } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrderWithItems(Number(id));
  if (!data) notFound();

  const { order, items } = data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
      <p className="text-neutral-500 mb-8">
        Order #{order.id} has been received. We&rsquo;ll be in touch shortly.
      </p>

      <div className="text-left border border-neutral-200 rounded-lg p-5 bg-white">
        <h2 className="font-medium mb-3 text-sm">Order Details</h2>
        <div className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>${item.line_total.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-200 mt-3 pt-3 flex justify-between font-semibold text-sm">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <Link
        href="/"
        className="inline-block mt-8 bg-neutral-900 text-white px-5 py-2.5 rounded-md text-sm font-medium"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
