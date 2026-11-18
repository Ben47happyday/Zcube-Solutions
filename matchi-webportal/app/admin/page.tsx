import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { listOrders, getOrderItems } from "@/lib/db";
import AdminOrdersTable from "@/components/AdminOrdersTable";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    redirect("/admin/login");
  }

  const orders = await listOrders();
  const withItems = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      items: await getOrderItems(order.id),
    }))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Orders</h1>
        <LogoutButton />
      </div>
      <AdminOrdersTable orders={withItems} />
    </div>
  );
}
