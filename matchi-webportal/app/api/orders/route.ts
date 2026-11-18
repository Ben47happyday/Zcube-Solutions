import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders, getOrderItems, type OrderInput } from "@/lib/db";
import { sendOrderNotification } from "@/lib/mailer";
import { getProductBySku } from "@/lib/products";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

type CartLineInput = {
  sku: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  const body = await req.json();

  const companyName = String(body.companyName || "").trim();
  const contactName = String(body.contactName || "").trim();
  const email = String(body.email || "").trim();
  const phone = body.phone ? String(body.phone).trim() : undefined;
  const address = body.address ? String(body.address).trim() : undefined;
  const notes = body.notes ? String(body.notes).trim() : undefined;
  const cartLines: CartLineInput[] = Array.isArray(body.items) ? body.items : [];

  if (!companyName || !contactName || !email) {
    return NextResponse.json(
      { error: "Company name, contact name, and email are required." },
      { status: 400 }
    );
  }
  if (cartLines.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const items = [];
  for (const line of cartLines) {
    const product = getProductBySku(String(line.sku));
    if (!product) {
      return NextResponse.json(
        { error: `Unknown product SKU: ${line.sku}` },
        { status: 400 }
      );
    }
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 0));
    if (quantity < product.minOrder) {
      return NextResponse.json(
        {
          error: `${product.name} requires a minimum order of ${product.minOrder}.`,
        },
        { status: 400 }
      );
    }
    items.push({
      sku: product.sku,
      productName: product.name,
      unitPrice: product.ondemandPrice,
      quantity,
    });
  }

  const orderInput: OrderInput = {
    companyName,
    contactName,
    email,
    phone,
    address,
    notes,
    items,
  };

  const { id, total } = await createOrder(orderInput);

  const emailResult = await sendOrderNotification(id, total, orderInput);

  return NextResponse.json({
    orderId: id,
    total,
    emailSent: emailResult.sent,
    emailReason: emailResult.reason,
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await listOrders();
  const withItems = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      items: await getOrderItems(order.id),
    }))
  );

  return NextResponse.json({ orders: withItems });
}
