import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

const base = "http://localhost:3000";

function redirectedTo(response: { headers(): Record<string, string> }): URL {
  return new URL(response.headers().location, base);
}

// The signed-in tests create throwaway users and point the single
// salon_owner row at them, so they need the service role key. The
// values are read from .env.local at run time and are never logged
// or stored in the repo.
function loadEnvFile(): void {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const contents = readFileSync(".env.local", "utf8");
  for (const line of contents.split("\n")) {
    const match = /^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=(.*)$/.exec(
      line.trim(),
    );
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key]) continue;
    process.env[key] = raw.replace(/^["']|["']$/g, "");
  }
}

function createAdminClient(): SupabaseClient {
  loadEnvFile();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function createUser(
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

// Points the single salon_owner row at the given user for the duration
// of a test and returns a function that puts the previous row back, so
// a real owner row, once it exists, is never destroyed.
async function claimOwnerRow(
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

async function signInThroughTheForm(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  const form = page.locator("form:visible");
  await form.locator('input[type="email"]').fill(email);
  await form.locator('input[name="password"]').fill(password);
  await form.getByRole("button", { name: /sign in/i }).click();
}

// The signed-in tests swap the one salon_owner row, so they must not
// race each other or the other files' dashboard tests.
test.describe.configure({ mode: "serial" });

test.describe.skip("owner route protection", () => {
  test("a signed-out visitor is redirected away from the dashboard", async ({
    request,
  }) => {
    const response = await request.get("/dashboard", { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    expect(redirectedTo(response).pathname).toBe("/login");
  });

  test("a nested dashboard route is redirected as well", async ({ request }) => {
    const response = await request.get("/dashboard/settings", {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(redirectedTo(response).pathname).toBe("/login");
  });

  test("the redirect drops the query string of the original request", async ({
    request,
  }) => {
    const response = await request.get("/dashboard?token=not-a-real-token", {
      maxRedirects: 0,
    });

    expect(redirectedTo(response).pathname).toBe("/login");
    expect(redirectedTo(response).search).toBe("");
  });

  test("a signed-out visitor ends up on the login path in a browser", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    expect(new URL(page.url()).pathname).toBe("/login");
  });

  test("a public page is untouched by the owner session check", async ({
    page,
  }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/");
  });
});

test.describe("a signed-in owner", () => {
  test("signs in through the form and reaches the dashboard", async ({
    page,
  }) => {
    const admin = createAdminClient();
    const owner = await createUser(admin, "owner");
    const restoreRow = await claimOwnerRow(admin, owner.id);
    try {
      await signInThroughTheForm(page, owner.email, owner.password);

      // The dashboard page itself arrives in Phase 9. Reaching the
      // path means the sign-in server action's getOwner() in
      // lib/auth.ts and the proxy's isSalonOwner() in
      // lib/supabase/proxy.ts both accepted the session.
      await expect(page).toHaveURL(/\/dashboard$/);
    } finally {
      await restoreRow();
      await admin.auth.admin.deleteUser(owner.id);
    }
  });

  test("is signed out and bounced to the login page once the row belongs to someone else", async ({
    page,
  }) => {
    const admin = createAdminClient();
    const owner = await createUser(admin, "owner");
    const restoreRow = await claimOwnerRow(admin, owner.id);
    try {
      await signInThroughTheForm(page, owner.email, owner.password);
      await expect(page).toHaveURL(/\/dashboard$/);

      // The row now belongs to a different user id, so the proxy's
      // isSalonOwner() must refuse the still-valid session.
      const swap = await admin
        .from("salon_owner")
        .update({ user_id: crypto.randomUUID() })
        .eq("id", 1);
      if (swap.error) throw new Error(`swap salon_owner: ${swap.error.message}`);

      await page.goto("/dashboard");
      expect(new URL(page.url()).pathname).toBe("/login");
    } finally {
      await restoreRow();
      await admin.auth.admin.deleteUser(owner.id);
    }
  });
});

test.describe("a signed-in stranger", () => {
  test("is refused at sign-in with no provider detail", async ({ page }) => {
    const admin = createAdminClient();
    const owner = await createUser(admin, "owner");
    const stranger = await createUser(admin, "stranger");
    const restoreRow = await claimOwnerRow(admin, owner.id);
    try {
      await signInThroughTheForm(page, stranger.email, stranger.password);

      // The sign-in server action runs getOwner() from lib/auth.ts,
      // which must reject the stranger, sign them out again and keep
      // them on /login.
      const form = page.locator("form:visible");
      await expect(form.locator('p[role="alert"]')).toHaveText(
        "That account is not the salon owner.",
      );
      expect(new URL(page.url()).pathname).toBe("/login");
    } finally {
      await restoreRow();
      await admin.auth.admin.deleteUser(owner.id);
      await admin.auth.admin.deleteUser(stranger.id);
    }
  });
});
