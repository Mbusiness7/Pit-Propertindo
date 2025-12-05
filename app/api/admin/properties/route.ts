// app/api/admin/properties/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAuthenticated } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { mode, id, payload } = body as {
    mode: "create" | "update";
    id?: string | null;
    payload: any;
  };

  if (mode === "create") {
    const { error } = await supabaseAdmin.from("properties").insert(payload);
    if (error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  if (mode === "update") {
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }
    const { error } = await supabaseAdmin.from("properties").update(payload).eq("id", id);
    if (error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  return new NextResponse("Invalid mode", { status: 400 });
}
