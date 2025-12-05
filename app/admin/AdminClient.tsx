"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Property } from "@/data/properties";

type FormState = {
  slug: string;
  title: string;
  location: string;
  sizeM2: string;
  price: string;
  status: "available" | "sold" | "reserved";
  description: string;
  images: string; // comma-separated URLs
};

function generateYouTubeSlug(length = 11) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
const emptyForm: FormState = {
  slug: generateYouTubeSlug(), // 🔥 auto slug
  title: "",
  location: "",
  sizeM2: "",
  price: "",
  status: "available",
  description: "",
  images: "",
};


const BUCKET_NAME = "property-images"; // pastikan sama persis dengan nama bucket di Supabase

function rowToProperty(row: any): Property {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    sizeM2: row.size_m2 ?? 0,
    price: row.price ?? "",
    status: row.status ?? "available",
    description: row.description ?? "",
    images: row.images ?? [],
    features: row.features ?? [],
  };
}

export default function AdminClient() {
  const [items, setItems] = useState<Property[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // parse images string → array for gallery
  const imageList = useMemo(
    () =>
      form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [form.images]
  );

  async function fetchProperties() {
    setLoading(true);

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading properties:", error.message);
      setLoading(false);
      return;
    }

    setItems((data || []).map(rowToProperty));
    setLoading(false);
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  function handleChange(field: keyof FormState, value: string | FormState["status"]) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
  setForm({
    ...emptyForm,
    slug: generateYouTubeSlug(), // generate fresh
  });
  setEditingId(null);
}


  function handleEdit(id: string) {
    const p = items.find((item) => item.id === id);
    if (!p) return;
    setEditingId(id);
    setForm({
      slug: p.slug,
      title: p.title,
      location: p.location,
      sizeM2: String(p.sizeM2 || ""),
      price: p.price,
      status: p.status,
      description: p.description,
      images: (p.images || []).join(", "),
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus properti ini?")) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      alert("Gagal menghapus: " + error.message);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.slug || !form.title) {
      alert("Slug dan judul wajib diisi.");
      return;
    }

    const sizeNumber = parseInt(form.sizeM2 || "0", 10);
    const imagesArray = imageList;

    const payload = {
      slug: form.slug,
      title: form.title,
      location: form.location,
      size_m2: Number.isNaN(sizeNumber) ? null : sizeNumber,
      price: form.price,
      status: form.status,
      description: form.description,
      images: imagesArray.length > 0 ? imagesArray : null,
    };

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        alert("Gagal menyimpan perubahan: " + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("properties").insert(payload);
      if (error) {
        alert("Gagal menambah properti: " + error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    resetForm();
    await fetchProperties();
  }

  // ================= IMAGE UPLOAD =================

  async function handleFilesUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    if (!form.slug) {
      alert("Isi slug dulu sebelum upload gambar (jadi nama folder di bucket).");
      return;
    }

    setUploadingImages(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${form.slug}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (error) {
        console.error("Upload error:", error.message);
        setUploadError("Sebagian / semua gambar gagal diupload. Cek console & bucket name.");
        alert("Upload gagal: " + error.message);
        continue;
      }

      // ✅ getPublicUrl returns hanya { data }, tidak ada error
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      if (publicData?.publicUrl) {
        console.log("Public URL:", publicData.publicUrl);
        uploadedUrls.push(publicData.publicUrl);
      } else {
        console.warn("Public URL tidak terbaca untuk path:", data.path);
      }
    }

    if (uploadedUrls.length > 0) {
      const merged = [...imageList, ...uploadedUrls];
      setForm((prev) => ({
        ...prev,
        images: merged.join(", "),
      }));
    }

    setUploadingImages(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    handleFilesUpload(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  // ================= GALLERY ACTIONS =================

  function handleRemoveImage(index: number) {
    const next = imageList.filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      images: next.join(", "),
    }));
  }

  function handleMoveImage(index: number, direction: "up" | "down") {
    const next = [...imageList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    const temp = next[targetIndex];
    next[targetIndex] = next[index];
    next[index] = temp;

    setForm((prev) => ({
      ...prev,
      images: next.join(", "),
    }));
  }

  return (
    <main className="bg-slate-900">
      <section className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-semibold">Admin Properti</h1>
            <p className="text-sm text-slate-300">
              Halaman ini untuk admin <span className="font-semibold">Pit Propertindo</span>. Di sini
              kamu bisa menambah, mengedit, dan menghapus data properti langsung ke database Supabase.
            </p>
          </div>

          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="rounded-full border border-slate-600 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
            >
              Logout
            </button>
          </form>
        </header>

        {/* FORM */}
        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100">
          <h2 className="mb-3 text-base font-semibold">
            {editingId ? "Edit Properti" : "Tambah Properti Baru"}
          </h2>

          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs text-slate-300">Judul</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs outline-none focus:border-sky-500"
                  placeholder="Kavling Puri Indah 200 m²"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">Lokasi</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs outline-none focus:border-sky-500"
                  placeholder="Puri Indah, Jakarta Barat"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-300">Luas (m²)</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs outline-none focus:border-sky-500"
                    placeholder="200"
                    value={form.sizeM2}
                    onChange={(e) => handleChange("sizeM2", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-300">Status</label>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs outline-none focus:border-sky-500"
                    value={form.status}
                    onChange={(e) =>
                      handleChange("status", e.target.value as FormState["status"])
                    }
                  >
                    <option value="available">Tersedia</option>
                    <option value="reserved">Dipesan</option>
                    <option value="sold">Terjual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">Harga (tulis manual)</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs outline-none focus:border-sky-500"
                  placeholder="2500000000"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs text-slate-300">Deskripsi</label>
                <textarea
                  className="h-24 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs outline-none focus:border-sky-500"
                  placeholder="Tuliskan deskripsi singkat properti..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              {/* UPLOAD + GALLERY */}
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Gambar Properti (upload / drag &amp; drop)
                </label>

                {/* Dropzone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="mb-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-600 bg-slate-900 px-3 py-4 text-center text-[11px] text-slate-300 hover:border-sky-500"
                  onClick={() => {
                    const input = document.getElementById(
                      "image-upload-input"
                    ) as HTMLInputElement | null;
                    input?.click();
                  }}
                >
                  <p className="font-semibold">Klik untuk pilih file gambar</p>
                  <p className="text-[10px] text-slate-400">
                    atau drag &amp; drop gambar ke sini (bisa banyak sekaligus)
                  </p>
                  {uploadingImages && (
                    <p className="mt-1 text-[10px] text-sky-400">Mengupload gambar...</p>
                  )}
                  {uploadError && (
                    <p className="mt-1 text-[10px] text-rose-400">{uploadError}</p>
                  )}
                </div>

                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesUpload(e.target.files)}
                />

                {/* optional raw textarea to manually edit URLs */}
                <textarea
                  className="mt-2 h-14 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs outline-none focus:border-sky-500"
                  placeholder="URL gambar dipisah koma, atau biarkan kosong untuk placeholder."
                  value={form.images}
                  onChange={(e) => handleChange("images", e.target.value)}
                />

                <p className="mt-1 text-[10px] text-slate-400">
                  Gambar yang diupload akan otomatis muncul di sini sebagai URL. Bisa dihapus / 
                  diurutkan ulang lewat gallery di bawah.
                </p>
              </div>

              {/* GALLERY PREVIEW */}
              {imageList.length > 0 && (
                <div className="mt-2 rounded-lg border border-slate-700 bg-slate-900/80 p-2">
                  <p className="mb-2 text-[11px] font-semibold text-slate-300">
                    Gallery ({imageList.length} gambar)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {imageList.map((url, idx) => (
                      <div
                        key={url + idx}
                        className="relative flex w-20 flex-col rounded-md border border-slate-700 bg-slate-950"
                      >
                        <img
                          src={url}
                          alt={`Image ${idx + 1}`}
                          className="h-16 w-full rounded-t-md object-cover"
                        />
                        <div className="flex items-center justify-between px-1 pb-1 pt-0.5">
                          <span className="text-[9px] text-slate-400">#{idx + 1}</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="rounded bg-slate-800 px-1 text-[9px]"
                              onClick={() => handleMoveImage(idx, "up")}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="rounded bg-slate-800 px-1 text-[9px]"
                              onClick={() => handleMoveImage(idx, "down")}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="rounded bg-rose-700 px-1 text-[9px] text-rose-50"
                              onClick={() => handleRemoveImage(idx)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Properti"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-slate-600 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* TABLE */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-100">
          <h2 className="mb-3 text-sm font-semibold">Daftar Properti</h2>

          {loading ? (
            <p className="text-slate-400">Memuat data...</p>
          ) : items.length === 0 ? (
            <p className="text-slate-400">Belum ada data properti.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-300">
                    <th className="px-2 py-1 text-left">Judul</th>
                    <th className="px-2 py-1 text-left">Slug</th>
                    <th className="px-2 py-1 text-left">Luas</th>
                    <th className="px-2 py-1 text-left">Harga</th>
                    <th className="px-2 py-1 text-left">Status</th>
                    <th className="px-2 py-1 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr
                      key={p.id ?? p.slug}
                      className="border-b border-slate-800/60 align-top"
                    >
                      <td className="px-2 py-1">{p.title}</td>
                      <td className="px-2 py-1 text-slate-400">{p.slug}</td>
                      <td className="px-2 py-1">{p.sizeM2} m²</td>
                      <td className="px-2 py-1">Rp {p.price}</td>
                      <td className="px-2 py-1">
                        {p.status === "available"
                          ? "Tersedia"
                          : p.status === "sold"
                          ? "Terjual"
                          : "Dipesan"}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {p.id && (
                          <>
                            <button
                              className="mr-2 rounded-full border border-slate-600 px-2 py-0.5 text-[10px] hover:bg-slate-800"
                              onClick={() => handleEdit(p.id as string)}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-full border border-rose-600 px-2 py-0.5 text-[10px] text-rose-300 hover:bg-rose-700/40"
                              onClick={() => handleDelete(p.id as string)}
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
