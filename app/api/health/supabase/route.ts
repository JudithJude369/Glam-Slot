import { NextResponse } from "next/server";
import { checkSupabaseConnection } from "@/lib/supabase/health";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const { ok } = await checkSupabaseConnection();

  return NextResponse.json({ ok }, { status: ok ? 200 : 503 });
}
