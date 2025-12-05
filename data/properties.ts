// data/properties.ts

export type Property = {
  id?: string;
  slug: string;
  title: string;
  location: string;
  sizeM2: number;
  price: string;
  status: "available" | "sold" | "reserved";
  description: string;
  images: string[];
  features?: string[];
};

export const properties: Property[] = [
  {
    slug: "kavling-puri-indah-200",
    title: "Kavling Puri Indah 200 m²",
    location: "Puri Indah, Jakarta Barat",
    sizeM2: 200,
    price: "2.500.000.000",
    status: "available",
    description:
      "Kavling siap bangun di kawasan Puri Indah. Lingkungan tenang, akses dekat tol dan pusat perbelanjaan.",
    images: ["/properti/puri-200-1.jpg", "/properti/puri-200-2.jpg"],
    features: ["SHM", "Lebar jalan 8 m", "Dekat mall & tol"],
  },
  {
    slug: "kavling-citra-garden-150",
    title: "Kavling Citra Garden 150 m²",
    location: "Citra Garden, Jakarta Barat",
    sizeM2: 150,
    price: "1.800.000.000",
    status: "available",
    description:
      "Tanah kavling di Citra Garden, cocok untuk hunian keluarga maupun investasi jangka panjang.",
    images: ["/properti/citra-150-1.jpg"],
    features: ["HGB", "Lingkungan cluster", "Dekat sekolah & rumah ibadah"],
  },
  {
    slug: "lahan-jakbar-300",
    title: "Lahan Siap Bangun 300 m²",
    location: "Jakarta Barat",
    sizeM2: 300,
    price: "3.600.000.000",
    status: "reserved",
    description:
      "Lahan luas di kawasan strategis Jakarta Barat, cocok untuk bangun rumah mewah atau kantor kecil.",
    images: [], // kosong -> akan pakai placeholder
    features: ["Akses mobil 2 arah", "Legalitas jelas"],
  },
];
