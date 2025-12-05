"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Property } from "@/data/properties";

type PropertyWithNumber = Property & { priceNumber: number | null };

// Rp1,000,000.00
function formatRupiahNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getStatusConfig(status: Property["status"]) {
  if (status === "sold") {
    return { label: "Terjual", className: "bg-rose-500/10 text-rose-300 border-rose-500/40" };
  }
  if (status === "reserved") {
    return {
      label: "Dipesan",
      className: "bg-amber-500/10 text-amber-300 border-amber-500/40",
    };
  }
  return {
    label: "Tersedia",
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  };
}

type Props = {
  properties: PropertyWithNumber[];
};

export default function PropertyListClient({ properties }: Props) {
  const [q, setQ] = useState("");
  const [priceBand, setPriceBand] = useState<"all" | "under500" | "500to1" | "1to2" | "over2">(
    "all"
  );
  const [sort, setSort] = useState<"newest" | "cheap" | "expensive">("newest");

  const filtered = useMemo(() => {
    let list = [...properties];

    // text search
    if (q.trim()) {
      const term = q.toLowerCase().trim();
      list = list.filter((p) => {
        const t = p.title.toLowerCase();
        const loc = (p.location || "").toLowerCase();
        return t.includes(term) || loc.includes(term);
      });
    }

    // price band
    list = list.filter((p) => {
      const price = p.priceNumber;
      if (price === null) return true; // "harga nego" lolos semua

      switch (priceBand) {
        case "under500":
          return price < 500_000_000;
        case "500to1":
          return price >= 500_000_000 && price <= 1_000_000_000;
        case "1to2":
          return price >= 1_000_000_000 && price <= 2_000_000_000;
        case "over2":
          return price > 2_000_000_000;
        default:
          return true;
      }
    });

    // sort
    if (sort === "cheap") {
      list.sort((a, b) => {
        const pa = a.priceNumber ?? Infinity;
        const pb = b.priceNumber ?? Infinity;
        return pa - pb;
      });
    } else if (sort === "expensive") {
      list.sort((a, b) => {
        const pa = a.priceNumber ?? -Infinity;
        const pb = b.priceNumber ?? -Infinity;
        return pb - pa;
      });
    }
    // newest = original order from server

    return list;
  }, [properties, q, priceBand, sort]);

  return (
    <>
      {/* FILTER BAR (no form submit, fully client) */}
      <div className="mb-6 space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul atau lokasi (misal: Puri Indah, kavling, ruko)..."
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
          />
          {q || priceBand !== "all" || sort !== "newest" ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setPriceBand("all");
                setSort("newest");
              }}
              className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              Reset
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex flex-1 min-w-[180px] flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide text-slate-400">
              Rentang harga
            </label>
            <select
              value={priceBand}
              onChange={(e) => setPriceBand(e.target.value as typeof priceBand)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
            >
              <option value="all">Semua harga</option>
              <option value="under500">Di bawah Rp500,000,000</option>
              <option value="500to1">Rp500,000,000 – Rp1,000,000,000</option>
              <option value="1to2">Rp1,000,000,000 – Rp2,000,000,000</option>
              <option value="over2">Di atas Rp2,000,000,000</option>
            </select>
          </div>

          <div className="flex flex-1 min-w-[160px] flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide text-slate-400">
              Urutkan
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
            >
              <option value="newest">Terbaru</option>
              <option value="cheap">Harga termurah</option>
              <option value="expensive">Harga termahal</option>
            </select>
          </div>
        </div>

        {/* count */}
        <p className="text-[11px] text-slate-500">
          Menampilkan <span className="font-semibold text-slate-200">{filtered.length}</span>{" "}
          properti dari {properties.length}.
        </p>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400">
          Tidak ditemukan properti dengan filter tersebut. Coba kata kunci atau rentang harga yang
          berbeda.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const firstImage = p.images[0] || "/placeholder.jpg";
            const statusCfg = getStatusConfig(p.status);

            return (
              <Link
                key={p.slug}
                href={`/properti/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 shadow-sm transition hover:border-sky-500/80 hover:shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                  <img
                    src={firstImage}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span
                    className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusCfg.className}`}
                  >
                    {statusCfg.label}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3">
                  <h2 className="mb-1 text-sm font-semibold text-sky-400 group-hover:underline">
                    {p.title}
                  </h2>
                  <p className="mb-1 text-xs text-slate-300">{p.location}</p>
                  <p className="mb-2 text-xs text-slate-400">
                    Luas: {p.sizeM2 ? `${p.sizeM2} m²` : "-"}
                  </p>

                  <p className="mt-auto text-sm font-semibold text-emerald-300">
                    {p.price && p.priceNumber
                      ? `Rp${formatRupiahNumber(p.priceNumber)}`
                      : "Harga nego"}
                  </p>
                  <span className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                    Klik untuk detail
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
