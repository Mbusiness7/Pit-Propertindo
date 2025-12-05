// app/api/admin/properties/delete/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAuthenticated } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { id } = body as { id?: string };

  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  const { error } = await supabaseAdmin.from("properties").delete().eq("id", id);
  if (error) {
    return new NextResponse(error.message, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
