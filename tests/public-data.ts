import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

// The public pages render services and team from the database, so the tests
// read the same rows back through the anon key rather than importing
// lib/sample-content, which is being deleted. The webServer command loads
// .env.local for the built site, but the Playwright process itself does not,
// so the keys are read here the same way the settings specs do it.
//
// The glamslot-test guard used to live in global-setup.ts, which blocked every
// Playwright run that pointed at the live project. Its purpose is to stop specs
// that WRITE to a database from touching the owner's real data, so it belongs
// in the admin client below and not in the shared setup.
const TEST_PROJECT_REF = "jfnmvouaboannzqncwlu";

export function assertTestDatabase(url: string | undefined): void {
  if (!url || !url.includes(TEST_PROJECT_REF)) {
    throw new Error("Refusing to run: this is not the glamslot-test project.");
  }
}

export function loadEnvFile(): void {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return;
  }
  const contents = readFileSync(".env.local", "utf8");
  for (const line of contents.split("\n")) {
    const match = /^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY)=(.*)$/.exec(
      line.trim(),
    );
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key]) continue;
    process.env[key] = raw.replace(/^["']|["']$/g, "");
  }
}

export function createAnonClient(): SupabaseClient {
  loadEnvFile();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local",
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAdminClient(): SupabaseClient {
  loadEnvFile();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local",
    );
  }
  assertTestDatabase(url);
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createUser(
  admin: SupabaseClient,
  label: string,
): Promise<{ id: string; email: string; password: string }> {
  const email = `glamslot-e2e-${label}-${Date.now()}@example.com`;
  const password = crypto.randomUUID();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`create ${label} user: ${error?.message ?? "no user"}`);
  }
  return { id: data.user.id, email, password };
}

export async function claimOwnerRow(
  admin: SupabaseClient,
  userId: string,
): Promise<() => Promise<void>> {
  const existing = await admin.from("salon_owner").select("user_id").maybeSingle();
  if (existing.error && existing.error.code !== "PGRST116") {
    throw new Error(`read salon_owner: ${existing.error.message}`);
  }
  const previous = existing.data?.user_id ?? null;

  const claim = previous
    ? await admin.from("salon_owner").update({ user_id: userId }).eq("id", 1)
    : await admin.from("salon_owner").insert({ user_id: userId });
  if (claim.error) throw new Error(`claim salon_owner: ${claim.error.message}`);

  return async () => {
    const restore = previous
      ? await admin.from("salon_owner").update({ user_id: previous }).eq("id", 1)
      : await admin.from("salon_owner").delete().eq("id", 1);
    if (restore.error) {
      throw new Error(`restore salon_owner: ${restore.error.message}`);
    }
  };
}

export async function signInThroughTheForm(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  const form = page.locator("form:visible");
  await form.locator('input[type="email"]').fill(email);
  await form.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

export async function getPublicServiceNames(): Promise<string[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("services")
    .select("name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`services: ${error.message}`);
  return (data ?? []).map((row) => row.name);
}

export async function getPublicTeamNames(): Promise<string[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("staff")
    .select("name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`staff: ${error.message}`);
  return (data ?? []).map((row) => row.name);
}