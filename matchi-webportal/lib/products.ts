import productsData from "@/data/products.json";

export type Product = {
  sku: string;
  displayOrder: number;
  isNew: boolean;
  name: string;
  sizeCm: string;
  image: string;
  ondemandPrice: number;
  retailMin: number;
  retailMax: number;
  minOrder: number;
  category: string;
  shape: string;
};

export const products = productsData as Product[];

export function getProductBySku(sku: string): Product | undefined {
  return products.find((p) => p.sku === sku);
}

export function getProductImages(product: Product): string[] {
  const extra = (product as { images?: string[] }).images;
  return extra && extra.length > 0 ? extra : [product.image];
}

export const categories = Array.from(
  new Set(products.map((p) => p.category))
).sort();

export const shapes = Array.from(new Set(products.map((p) => p.shape))).sort();

export const sizes = Array.from(new Set(products.map((p) => p.sizeCm)));

export const priceBounds = products.reduce(
  (acc, p) => ({
    min: Math.min(acc.min, p.ondemandPrice),
    max: Math.max(acc.max, p.ondemandPrice),
  }),
  { min: Infinity, max: -Infinity }
);
