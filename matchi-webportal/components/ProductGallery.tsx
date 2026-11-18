"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function go(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      go(deltaX < 0 ? 1 : -1);
    }
    touchStartX.current = null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={images[index]}
          src={withBasePath(images[index])}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain animate-[fadein_0.2s_ease-out]"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-900 w-9 h-9 rounded-full flex items-center justify-center shadow"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-900 w-9 h-9 rounded-full flex items-center justify-center shadow"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === index ? "bg-neutral-900" : "bg-neutral-900/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIndex(i)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                i === index ? "border-neutral-900" : "border-transparent"
              }`}
            >
              <Image src={withBasePath(src)} alt="" fill sizes="64px" className="object-contain bg-neutral-100" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
