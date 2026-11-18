import type { OrderInput } from "@/lib/db";

// Sends via Microsoft Graph's sendMail API (app-only OAuth2 client
// credentials) from an Azure AD app registration with Mail.Send permission
// on the sender mailbox — see MS_GRAPH_* in .env.example.

const GRAPH_TOKEN_URL =
  "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token";
const GRAPH_SEND_MAIL_URL =
  "https://graph.microsoft.com/v1.0/users/{sender}/sendMail";

function graphConfigured(): boolean {
  return Boolean(
    process.env.MS_GRAPH_TENANT_ID &&
      process.env.MS_GRAPH_CLIENT_ID &&
      process.env.MS_GRAPH_CLIENT_SECRET &&
      process.env.MS_GRAPH_SENDER_EMAIL
  );
}

async function getGraphToken(): Promise<string> {
  const url = GRAPH_TOKEN_URL.replace(
    "{tenant}",
    process.env.MS_GRAPH_TENANT_ID!
  );
  const body = new URLSearchParams({
    client_id: process.env.MS_GRAPH_CLIENT_ID!,
    client_secret: process.env.MS_GRAPH_CLIENT_SECRET!,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Graph token request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

export async function sendOrderNotification(
  orderId: number,
  total: number,
  input: OrderInput
): Promise<{ sent: boolean; reason?: string }> {
  const notifyTo = process.env.NOTIFY_EMAIL;

  if (!graphConfigured() || !notifyTo) {
    return {
      sent: false,
      reason:
        "Email not configured (MS_GRAPH_TENANT_ID / MS_GRAPH_CLIENT_ID / MS_GRAPH_CLIENT_SECRET / MS_GRAPH_SENDER_EMAIL / NOTIFY_EMAIL missing)",
    };
  }

  const itemRows = input.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 10px;border:1px solid #ddd;">${item.sku}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;">${item.productName}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${item.quantity}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatCurrency(item.unitPrice * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px;">
      <h2 style="margin-bottom:4px;">New Order #${orderId}</h2>
      <p style="color:#555;margin-top:0;">Placed ${new Date().toLocaleString()}</p>

      <h3>Customer</h3>
      <p>
        <strong>${input.companyName}</strong><br/>
        ${input.contactName}<br/>
        ${input.email}${input.phone ? ` · ${input.phone}` : ""}<br/>
        ${input.address ? `${input.address}<br/>` : ""}
      </p>
      ${input.notes ? `<p><strong>Notes:</strong> ${input.notes}</p>` : ""}

      <h3>Items</h3>
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr style="background:#f4f4f4;">
            <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">SKU</th>
            <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Product</th>
            <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Qty</th>
            <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Unit Price</th>
            <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="text-align:right;font-size:18px;margin-top:10px;"><strong>Total: ${formatCurrency(total)}</strong></p>
    </div>
  `;

  try {
    const token = await getGraphToken();
    const sender = process.env.MS_GRAPH_SENDER_EMAIL!;
    const url = GRAPH_SEND_MAIL_URL.replace(
      "{sender}",
      encodeURIComponent(sender)
    );
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: `New Order #${orderId} from ${input.companyName} — ${formatCurrency(total)}`,
          body: { contentType: "HTML", content: html },
          toRecipients: [{ emailAddress: { address: notifyTo } }],
          replyTo: [{ emailAddress: { address: input.email } }],
        },
        saveToSentItems: "true",
      }),
    });
    if (!res.ok) {
      throw new Error(`Graph sendMail failed: ${res.status}`);
    }
    return { sent: true };
  } catch (err) {
    console.error("Failed to send order notification email:", err);
    return { sent: false, reason: (err as Error).message };
  }
}
