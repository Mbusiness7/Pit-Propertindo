// app/properti/[slug]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import type { Property } from "@/data/properties";
import ImageGallery from "./ImageGallery";

type DbRow = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  size_m2: number | null;
  price: string | null;
  status: "available" | "sold" | "reserved" | null;
  description: string | null;
  images: string[] | null;
  features: string[] | null;
};

function rowToProperty(row: DbRow): Property {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location ?? "",
    sizeM2: row.size_m2 ?? 0,
    price: row.price ?? "",
    status: (row.status as Property["status"]) ?? "available",
    description: row.description ?? "",
    images: row.images ?? [],
    features: row.features ?? [],
  };
}

function getStatusLabel(status: Property["status"]) {
  if (status === "sold") return "Terjual";
  if (status === "reserved") return "Dipesan";
  return "Tersedia";
}

export const dynamic = "force-dynamic";

async function getPropertyBySlug(slug: string): Promise<{
  property: Property | null;
  errorMessage?: string;
}> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<DbRow>();

  if (error) {
    console.error("Error loading property detail from DB:", error.message);
    return { property: null, errorMessage: error.message };
  }

  if (!data) {
    console.warn("No property found for slug:", slug);
    return { property: null, errorMessage: "Properti dengan slug ini tidak ditemukan di database." };
  }

  return { property: rowToProperty(data) };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { property, errorMessage } = await getPropertyBySlug(slug);

  // 🔍 DEBUG MODE: instead of 404, show a simple error page
  if (!property) {
    return (
      <main className="bg-slate-900 min-h-screen text-slate-50">
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="mb-4 text-2xl font-semibold">Properti tidak ditemukan</h1>
          <p className="mb-2 text-sm text-slate-300">
            Slug: <span className="font-mono text-sky-300">{slug}</span>
          </p>
          <p className="mb-4 text-sm text-slate-400">
            {errorMessage ||
              "Row dengan slug ini tidak ada di tabel public.properties, atau diblokir oleh RLS."}
          </p>
          <p className="text-xs text-slate-500">
            Cek di Supabase &gt; Table Editor &gt; properties, pastikan baris dengan slug ini ada
            dan policy SELECT sudah mengizinkan public.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-slate-900">
      <section className="mx-auto max-w-5xl px-4 py-8 text-slate-50">
        {/* breadcrumb */}
        <div className="mb-4 text-xs text-slate-400">
          <span className="text-slate-500">Properti /</span>{" "}
          <span>{property.location || "Lokasi"}</span>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          {/* LEFT: IMAGE GALLERY + DESCRIPTION */}
          <div>
            <ImageGallery images={property.images} title={property.title} />

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
              <h2 className="mb-2 text-base font-semibold">Deskripsi</h2>
              <p className="whitespace-pre-line text-slate-200">
                {property.description || "Belum ada deskripsi untuk properti ini."}
              </p>
            </div>
          </div>

          {/* RIGHT: INFO BOX */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="mb-1 inline-block text-xs uppercase tracking-wide text-slate-400">
                {getStatusLabel(property.status)}
              </span>
              <h1 className="mb-2 text-2xl font-semibold">{property.title}</h1>
              <p className="mb-3 text-sm text-slate-300">
                {property.location || "Lokasi tidak tersedia"}
              </p>

              <p className="mb-1 text-xs text-slate-400">Harga</p>
              <p className="mb-3 text-lg font-semibold text-emerald-300">
                {property.price ? `Rp${property.price}` : "Hubungi untuk harga"}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div>
                  <p className="text-xs text-slate-400">Luas Tanah</p>
                  <p className="font-medium">
                    {property.sizeM2 ? `${property.sizeM2} m²` : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
              <h2 className="mb-2 text-base font-semibold">Tertarik?</h2>
              <p className="mb-3 text-slate-300">
                Hubungi kami untuk info lengkap, negosiasi harga, dan jadwal survei lokasi.
              </p>
              <a
                href={`https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20tanya%20mengenai%20properti:%20${encodeURIComponent(
                  property.title
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                Chat via WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
