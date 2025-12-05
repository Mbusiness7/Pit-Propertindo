// app/admin/page.tsx
import { isAuthenticated } from "@/lib/adminAuth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

function LoginForm({ error }: { error?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <form
        action="/admin/login"
        method="POST"
        className="w-full max-w-xs space-y-4 border border-slate-800 bg-slate-900/70 p-6 rounded-xl"
      >
        <h1 className="text-lg font-semibold text-center mb-2">
          Admin Login
        </h1>

        {error === "invalid" && (
          <p className="text-xs text-rose-400 text-center">
            Email atau password salah.
          </p>
        )}

        <div className="space-y-1">
          <label className="text-xs text-slate-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold hover:bg-sky-500"
        >
          Masuk
        </button>
      </form>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ unwrap the Promise Next 16 gives you
  const resolvedSearchParams = await searchParams;
  const errorParam = resolvedSearchParams?.error;
  const error = typeof errorParam === "string" ? errorParam : undefined;

  const authed = await isAuthenticated();

  if (!authed) {
    return <LoginForm error={error} />;
  }

  return <AdminClient />;
}
