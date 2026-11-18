import { Pool, types } from "pg";

// pg returns NUMERIC columns as strings by default (to avoid silent
// precision loss); this app's amounts fit safely in a JS number, so parse
// them back to numbers to match the shape the UI expects.
types.setTypeParser(types.builtins.NUMERIC, (value: string) => parseFloat(value));

// Orders live in their own "matchihomeware" schema so this app can share a
// Postgres instance with other apps/schemas without colliding.
const SCHEMA = "matchihomeware";

declare global {
  var __heymatPool: Pool | undefined;
  var __heymatSchemaReady: Promise<void> | undefined;
}

function getPool(): Pool {
  if (!global.__heymatPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    global.__heymatPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return global.__heymatPool;
}

async function ensureSchema(): Promise<void> {
  if (!global.__heymatSchemaReady) {
    global.__heymatSchemaReady = (async () => {
      const pool = getPool();
      await pool.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${SCHEMA}.orders (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          company_name TEXT NOT NULL,
          contact_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          address TEXT,
          notes TEXT,
          total NUMERIC NOT NULL,
          status TEXT NOT NULL DEFAULT 'new'
        );

        CREATE TABLE IF NOT EXISTS ${SCHEMA}.order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES ${SCHEMA}.orders(id),
          sku TEXT NOT NULL,
          product_name TEXT NOT NULL,
          unit_price NUMERIC NOT NULL,
          quantity INTEGER NOT NULL,
          line_total NUMERIC NOT NULL
        );
      `);
    })();
  }
  return global.__heymatSchemaReady;
}

export type OrderItemInput = {
  sku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type OrderInput = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  items: OrderItemInput[];
};

export type OrderRecord = {
  id: number;
  created_at: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  total: number;
  status: string;
};

export type OrderItemRecord = {
  id: number;
  order_id: number;
  sku: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export async function createOrder(
  input: OrderInput
): Promise<{ id: number; total: number }> {
  await ensureSchema();
  const pool = getPool();
  const total = input.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      `INSERT INTO ${SCHEMA}.orders
         (company_name, contact_name, email, phone, address, notes, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'new')
       RETURNING id`,
      [
        input.companyName,
        input.contactName,
        input.email,
        input.phone ?? null,
        input.address ?? null,
        input.notes ?? null,
        total,
      ]
    );
    const orderId = orderResult.rows[0].id as number;

    for (const item of input.items) {
      await client.query(
        `INSERT INTO ${SCHEMA}.order_items
           (order_id, sku, product_name, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderId,
          item.sku,
          item.productName,
          item.unitPrice,
          item.quantity,
          item.unitPrice * item.quantity,
        ]
      );
    }

    await client.query("COMMIT");
    return { id: orderId, total };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listOrders(): Promise<OrderRecord[]> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM ${SCHEMA}.orders ORDER BY created_at DESC`
  );
  return result.rows as OrderRecord[];
}

export async function getOrderItems(
  orderId: number
): Promise<OrderItemRecord[]> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM ${SCHEMA}.order_items WHERE order_id = $1 ORDER BY id ASC`,
    [orderId]
  );
  return result.rows as OrderItemRecord[];
}

export async function getOrderWithItems(orderId: number) {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM ${SCHEMA}.orders WHERE id = $1`,
    [orderId]
  );
  const order = result.rows[0] as OrderRecord | undefined;
  if (!order) return null;
  return { order, items: await getOrderItems(orderId) };
}

export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  await pool.query(`UPDATE ${SCHEMA}.orders SET status = $1 WHERE id = $2`, [
    status,
    orderId,
  ]);
}
