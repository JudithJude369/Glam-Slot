import { type NextRequest, NextResponse } from "next/server";
import { isSalonOwner, readSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { supabase, response, subject } = await readSession(request);

  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return response;
  }

  if (await isSalonOwner(supabase, subject)) {
    return response;
  }

  // A signed-in stranger is signed out, so the RLS owner check denies them
  // too and they cannot sit on a valid session.
  if (subject) {
    await supabase.auth.signOut();
  }

  const target = request.nextUrl.clone();
  target.pathname = "/login";
  target.search = "";
  const redirect = NextResponse.redirect(target);
  // Without this the refreshed or cleared cookies are dropped and the next
  // request still carries the old session. NextResponse.cookies has no
  // setAll in this version, so the cookies are copied one by one.
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export const config = {
  // Only the owner area needs a session. The customer pages never touch
  // Supabase, so they should not pay for a session refresh on every request.
  matcher: ["/dashboard/:path*", "/login"],
};