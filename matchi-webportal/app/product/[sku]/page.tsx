import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySku, getProductImages } from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import ProductDetailActions from "@/components/ProductDetailActions";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const product = getProductBySku(sku);
  if (!product) notFound();

  const images = getProductImages(product);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to catalog
      </Link>

      <div className="mt-4 grid md:grid-cols-2 gap-10">
        <ProductGallery images={images} alt={product.name} />

        <div className="flex flex-col gap-4">
          <div>
            {product.isNew && (
              <span className="inline-block bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded mb-2">
                NEW
              </span>
            )}
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-neutral-500 mt-1">SKU {product.sku}</p>
          </div>

          <div className="text-2xl font-semibold">
            ${product.ondemandPrice.toFixed(2)}{" "}
            <span className="text-sm font-normal text-neutral-500">per unit (ondemand wholesale)</span>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border border-neutral-200 rounded-lg p-4 bg-white">
            <dt className="text-neutral-500">Size</dt>
            <dd className="font-medium">{product.sizeCm} cm</dd>

            <dt className="text-neutral-500">Shape</dt>
            <dd className="font-medium">{product.shape}</dd>

            <dt className="text-neutral-500">Category</dt>
            <dd className="font-medium">{product.category}</dd>

            <dt className="text-neutral-500">Retail Price Range</dt>
            <dd className="font-medium">
              ${product.retailMin} - ${product.retailMax}
            </dd>

            <dt className="text-neutral-500">Minimum Order</dt>
            <dd className="font-medium">{product.minOrder} units</dd>
          </dl>

          <ProductDetailActions product={product} />
        </div>
      </div>
    </div>
  );
}
