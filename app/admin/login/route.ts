// app/admin/login/route.ts
import { NextResponse } from "next/server";
import { createSession, validateCredentials } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!validateCredentials(email, password)) {
    return NextResponse.redirect(new URL("/admin?error=invalid", request.url));
  }

  await createSession();

  return NextResponse.redirect(new URL("/admin", request.url));
}
