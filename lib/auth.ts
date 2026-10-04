import "server-only";
import { createClient } from "./supabase/server";

export type Owner =
  | { ok: true; data: { email: string } }
  | { ok: false; error: "no_session" | "not_owner" };

/**
 * The owner check for Server Components, Server Actions and Route Handlers.
 *
 * getClaims() verifies the access token signature before anything is
 * trusted; getSession() is never used because it reads the cookie without
 * revalidating. The owner row is matched on the subject claim, which the
 * Supabase auth server sets and which never changes for an account, so a
 * changed email address cannot lock the owner out.
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function getOwner(): Promise<Owner> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const subject = error ? null : data?.claims.sub;
  const email = error ? null : data?.claims.email;

  if (typeof subject !== "string" || subject.length === 0) {
    return { ok: false, error: "no_session" };
  }

  // RLS gives the owner this row and gives anyone else no rows at all.
  const { data: ownerRow, error: ownerError } = await supabase
    .from("salon_owner")
    .select("user_id")
    .maybeSingle();

  if (ownerError || !ownerRow) {
    return { ok: false, error: "not_owner" };
  }

  if (ownerRow.user_id !== subject) {
    return { ok: false, error: "not_owner" };
  }

  return { ok: true, data: { email: typeof email === "string" ? email : "" } };
}