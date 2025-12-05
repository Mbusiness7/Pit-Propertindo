// app/admin/logout/route.ts
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/adminAuth";

export async function POST(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", request.url));
}
