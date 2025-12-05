"use client";

import { useState } from "react";

export default function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  // if no images from DB → use placeholder only
  const normalized = images && images.length > 0 ? images : ["/placeholder.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentImage = normalized[currentIndex] ?? "/placeholder.jpg";
  const hasMultiple = normalized.length > 1;

  function handlePrev() {
    setCurrentIndex((prev) =>
      prev === 0 ? normalized.length - 1 : prev - 1
    );
  }

  function handleNext() {
    setCurrentIndex((prev) =>
      prev === normalized.length - 1 ? 0 : prev + 1
    );
  }

  return (
    <div>
      {/* MAIN IMAGE + ARROWS */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <img
          src={currentImage}
          alt={title}
          className="h-72 w-full object-cover md:h-96"
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS */}
      {hasMultiple && (
        <div className="mt-3 flex flex-wrap gap-2">
          {normalized.map((url, idx) => {
            const active = idx === currentIndex;

            return (
              <button
                key={url + idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`overflow-hidden rounded-md border ${
                  active
                    ? "border-sky-500 ring-1 ring-sky-500"
                    : "border-slate-700"
                } bg-slate-900`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-16 w-24 object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
