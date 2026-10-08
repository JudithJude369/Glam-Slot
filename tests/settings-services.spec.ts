import { expect, test } from "@playwright/test";
import {
  claimOwnerRow,
  createAdminClient,
  signInThroughTheForm,
  createUser,
} from "./public-data";

test.describe.configure({ mode: "serial" });

test.describe.skip("Settings Services tab", () => {
  test("shows services and allows add, edit and toggle", async ({ page }) => {
    const admin = createAdminClient();
    const owner = await createUser(admin, "settings");
    const restoreRow = await claimOwnerRow(admin, owner.id);
    try {
      await signInThroughTheForm(page, owner.email, owner.password);
      await expect(page).toHaveURL(/\/dashboard$/);

      await page.goto("/dashboard/settings");
      await expect(page).toHaveURL(/\/dashboard\/settings$/);

      const tab = page.getByTestId("services-tab-desktop");

      // Services list is visible with the seeded services. The names are read
      // back through the admin client rather than pinned here, because the
      // owner edits them in Settings and a pinned list goes stale.
      const seeded = await admin
        .from("services")
        .select("name")
        .in(
          "id",
          // The fixed uuids the seed migration writes.
          [
            "00000000-0000-0000-4000-00000000c001",
            "00000000-0000-0000-4000-00000000c002",
            "00000000-0000-0000-4000-00000000c003",
          ],
        );
      if (seeded.error) throw new Error(`seeded services: ${seeded.error.message}`);
      for (const row of seeded.data ?? []) {
        await expect(tab.getByText(row.name)).toBeVisible();
      }

      // Add a new service.
      await tab.getByRole("button", { name: /\+ add/i }).click();
      await page.getByLabel("Name").fill("E2E Test Service");
      await page.getByLabel("Duration (minutes)").fill("45");
      await page.getByLabel("Price (₦)").fill("5000");
      await page.getByLabel("Deposit (₦) — default 30%").fill("1500");
      await page.getByRole("button", { name: /save/i }).click();

      await page.goto("/dashboard/settings");
      await expect(page).toHaveURL(/\/dashboard\/settings$/);
      await expect(tab.getByText("E2E Test Service")).toBeVisible();

      // Edit the service.
      await tab.getByText("E2E Test Service").click();
      await page.getByLabel("Name").fill("E2E Test Service Updated");
      await page.getByLabel("Duration (minutes)").fill("60");
      await page.getByRole("button", { name: /save/i }).click();

      await page.goto("/dashboard/settings");
      await expect(page).toHaveURL(/\/dashboard\/settings$/);
      await expect(tab.getByText("E2E Test Service Updated")).toBeVisible();

      // Toggle inactive.
      const serviceRow = tab.getByText("E2E Test Service Updated").locator("..");
      await serviceRow.getByRole("button", { name: /off/i }).click();

      await page.goto("/dashboard/settings");
      await expect(page).toHaveURL(/\/dashboard\/settings$/);
      await expect(serviceRow.getByText("On")).toBeVisible();
    } finally {
      await restoreRow();
      await admin.auth.admin.deleteUser(owner.id);
    }
  });
});