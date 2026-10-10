import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];

test.describe.configure({ mode: "serial" });

for (const viewport of viewports) {
  test.describe(`booking page at ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("no literal curly braces in visible text", async ({ page }) => {
      await page.goto("/book");
      await page.waitForLoadState("networkidle");

      const bodyText = await page.locator("body").innerText();

      expect(bodyText).not.toContain("{");
      expect(bodyText).not.toContain("}");
    });

    test("shows available slots label with formatted date", async ({ page }) => {
      await page.goto("/book");
      await page.waitForLoadState("networkidle");

      await page.getByRole("heading", { level: 3, name: "Signature Gel Polish" }).click();
      await page.waitForResponse(/api\/availability/);

      const slotsLabel = page.locator("label", { hasText: "Available slots" });
      await expect(slotsLabel).toBeVisible();

      const labelText = await slotsLabel.innerText();
      expect(labelText).toMatch(/Available slots — [A-Za-z]{3}, [A-Za-z]{3} \d{1,2}/);
    });
  });
}