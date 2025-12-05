import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pit Propertindo",
  description: "Jual properti & tanah terjangkau dengan legalitas jelas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-50">
        <header className="border-b border-slate-800 bg-slate-950/95">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            
            {/* LOGO / BRAND */}
            <Link href="/" className="text-sm font-semibold">
              Pit Propertindo
            </Link>

            {/* RIGHT SIDE MENU */}
            <div className="flex items-center gap-4">
              <nav className="flex gap-6 text-xs text-slate-300">
                <Link href="/properti" className="hover:text-white">
                  Daftar Properti
                </Link>
                <Link href="/kontak" className="hover:text-white">
                  Kontak
                </Link>
                <Link
                  href="/admin"
                  className="hover:text-white opacity-60"
                >
                  Admin
                </Link>
              </nav>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/6281298814499?text=Halo%20saya%20ingin%20info%20lebih%20lanjut%20mengenai%20properti%20Pit%20Propertindo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </header>

        {children}

        <footer className="border-t border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500">
            © {new Date().getFullYear()} Pit Propertindo. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
