export default function ContactPage() {
  return (
    <main className="bg-slate-900 min-h-screen">
      <section className="mx-auto max-w-5xl px-4 py-10">
        
        <h1 className="mb-2 text-3xl font-semibold text-sky-100">Hubungi Kami</h1>
        <p className="mb-6 text-sm text-slate-300">
          Silakan hubungi kami untuk informasi lebih lanjut mengenai properti yang tersedia
          atau konsultasi kebutuhan Anda.
        </p>

        <div className="grid gap-8 md:grid-cols-2">

          {/* LEFT SIDE — CONTACT INFO */}
          <div className="space-y-6 text-sm text-slate-200">

            <div>
              <p className="font-semibold text-sky-300">Telepon / WhatsApp</p>
              <p className="text-slate-300 mt-1">+62 812 9881 4499</p>

              <a
                href="https://wa.me/6281298814499?text=Halo%20saya%20ingin%20info%20lebih%20lanjut%20mengenai%20properti%20Pit%20Propertindo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                Chat via WhatsApp
              </a>
            </div>

            <div>
              <p className="font-semibold text-sky-300">Email</p>
              <p className="text-slate-300 mt-1">petersjarifudin@gmail.com</p>
            </div>

            <div>
              <p className="font-semibold text-sky-300">Jam Operasional</p>
              <p className="text-slate-300 mt-1">Senin – Minggu: 08.00 – 17.00</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
