// app/admin/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminCredentials } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const ok = checkAdminCredentials(email, password);

  if (!ok) {
    const res = NextResponse.redirect(new URL("/admin?error=invalid", req.url));
    // clear cookie just in case
    const cookieStore = await cookies();
    cookieStore.set("pit_admin", "", { maxAge: 0 });
    return res;
  }

  const res = NextResponse.redirect(new URL("/admin", req.url));

  const cookieStore = await cookies();
  cookieStore.set("pit_admin", "ok", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 hours
    sameSite: "lax",
  });

  return res;
}
