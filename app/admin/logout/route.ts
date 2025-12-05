// app/admin/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/admin", req.url));
  const cookieStore = await cookies();

  cookieStore.set("pit_admin", "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}
