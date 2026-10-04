import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "./env";
import type { Database } from "../database.types";

export type Session = {
  supabase: SupabaseClient<Database>;
  response: NextResponse;
  subject: string | null;
};

/**
 * Runs inside the proxy, where `cookies()` from next/headers is not
 * available, so the client reads and writes cookies on the request and on
 * the response directly.
 *
 * getClaims() verifies the access token signature. getSession() must not be
 * used here: it reads the session out of the cookie without revalidating it,
 * so a forged cookie would pass.
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function readSession(request: NextRequest): Promise<Session> {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const subject = error ? null : data?.claims.sub;

  return {
    supabase,
    response,
    subject: typeof subject === "string" ? subject : null,
  };
}

/**
 * The owner is the signed-in user whose id matches public.salon_owner.
 * Same rule as private.is_salon_owner() in the RLS migration, checked here so
 * the proxy can redirect before the page renders. A signed-in stranger gets
 * no rows back from salon_owner, so this returns false for them.
 */
export async function isSalonOwner(
  supabase: Session["supabase"],
  subject: string | null,
): Promise<boolean> {
  if (!subject) return false;
  const { data } = await supabase.from("salon_owner").select("user_id").maybeSingle();
  if (!data) return false;
  return data.user_id === subject;
}