import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

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

test.describe.configure({ mode: "serial" });

test.skip("step by step settings", async ({ page }) => {
  const admin = createAdminClient();
  const owner = await createUser(admin, "settings-step");
  const restoreRow = await claimOwnerRow(admin, owner.id);
  try {
    await signInThroughTheForm(page, owner.email, owner.password);
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/\/dashboard\/settings$/);
    console.log("url ok");

    const tab = page.getByTestId("services-tab-desktop");
    await expect(tab.getByText("Signature Gel Manicure")).toBeVisible({ timeout: 10000 });
    console.log("service visible");

    await tab.getByRole("button", { name: /\+ add/i }).click();
    console.log("clicked add");

    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    console.log("dialog visible");

    await page.getByLabel("Name").fill("E2E Test Service");
    console.log("filled name");

    await page.getByLabel("Duration (minutes)").fill("45");
    await page.getByLabel("Price (₦)").fill("5000");
    await page.getByLabel("Deposit (₦) — default 30%").fill("1500");
    console.log("filled form");

    await page.getByRole("dialog").getByRole("button", { name: /save/i }).click();
    console.log("clicked save");

    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/\/dashboard\/settings$/);
    console.log("reloaded");

    await expect(tab.getByText("E2E Test Service")).toBeVisible({ timeout: 10000 });
    console.log("new service visible");
  } finally {
    await restoreRow();
    await admin.auth.admin.deleteUser(owner.id);
  }
});
