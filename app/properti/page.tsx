import { supabase } from "@/lib/supabaseClient";
import type { Property } from "@/data/properties";
import PropertyListClient from "./PropertyListClient";

type PropertyWithNumber = Property & { priceNumber: number | null };

function parsePriceToNumber(price: string | number | null | undefined): number | null {
  if (price === null || price === undefined) return null;
  if (typeof price === "number") return Number.isNaN(price) ? null : price;
  const cleaned = price.replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

async function getProperties(): Promise<PropertyWithNumber[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error.message);
    return [];
  }

  return (
    data?.map((row: any) => {
      const num = parsePriceToNumber(row.price ?? "");
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        location: row.location,
        sizeM2: row.size_m2 ?? 0,
        price: row.price ?? "",
        status: row.status ?? "available",
        description: row.description ?? "",
        images: row.images || [],
        features: row.features || [],
        priceNumber: num,
      };
    }) || []
  );
}

export default async function PropertyListPage() {
  const properties = await getProperties();

  return (
    <main className="bg-slate-900">
      <section className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-semibold">Daftar Properti</h1>
        <p className="mb-4 text-sm text-slate-300">
          Berikut beberapa properti dan tanah yang saat ini tersedia. Gunakan pencarian dan filter
          untuk mempersempit pilihan.
        </p>

        <PropertyListClient properties={properties} />
      </section>
    </main>
  );
}
