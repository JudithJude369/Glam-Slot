import { expect, test } from "@playwright/test";
import {
  claimOwnerRow,
  createAdminClient,
  signInThroughTheForm,
  createUser,
} from "./public-data";

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

    // The first seeded service is visible. Its name is read back rather than
    // pinned, because the owner edits services in Settings and a pinned name
    // goes stale.
    const seeded = await admin
      .from("services")
      .select("name")
      .in(
        "id",
        [
          "00000000-0000-0000-4000-00000000c001",
          "00000000-0000-0000-4000-00000000c002",
          "00000000-0000-0000-4000-00000000c003",
        ],
      )
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (seeded.error) throw new Error(`seeded service: ${seeded.error.message}`);
    if (!seeded.data) throw new Error("no seeded service to assert on");
    await expect(tab.getByText(seeded.data.name)).toBeVisible({ timeout: 10000 });
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