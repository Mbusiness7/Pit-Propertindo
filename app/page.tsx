import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-96px)] bg-slate-900">
      <section className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2">
        {/* LEFT: IMAGE */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg">
          <img
            src="/hero-house.jpg"
            alt="Rumah modern dengan papan dijual"
            className="h-full w-full object-cover"
          />
        </div>

        {/* RIGHT: TEXT */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-sky-400">
            Pit Propertindo • Area Jakarta & Sekitar
          </p>

          <h1 className="mb-3 text-4xl font-bold md:text-5xl">
            Jual Properti Terjangkau
          </h1>

          <p className="mb-2 text-sm text-slate-300">
            Kavling dan rumah siap bangun dengan harga masuk akal, legalitas jelas,
            dan lokasi strategis di Jakarta Barat.
          </p>

          <p className="mb-6 text-sm text-slate-400">
            Cocok untuk hunian pertama maupun investasi jangka panjang.
          </p>

          {/* CTAs */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/properti"
              className="inline-flex items-center rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-600"
            >
              Lihat Daftar Properti
            </Link>

            <Link
              href="https://wa.me/6281234567890" // ganti ke nomor WA kamu
              target="_blank"
              className="inline-flex items-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800"
            >
              Chat via WhatsApp
            </Link>
          </div>

          {/* TRUST BADGES */}
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-200">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Legalitas dicek notaris rekanan</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Bisa survey lokasi kapan saja</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
