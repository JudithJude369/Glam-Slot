import { expect, test } from "@playwright/test";
import { getPublicServiceNames } from "./public-data";

const viewports = [
  { name: "mobile", width: 375, height: 812, stickyBarVisible: true },
  { name: "tablet", width: 768, height: 1024, stickyBarVisible: false },
  { name: "desktop", width: 1280, height: 900, stickyBarVisible: false },
];

test.describe.configure({ mode: "serial" });

let services: string[] = [];

test.beforeAll(async () => {
  services = await getPublicServiceNames();
});

for (const viewport of viewports) {
  test.describe(`landing at ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("shows the heading, the services and a Book Now button", async ({
      page,
    }) => {
      const response = await page.goto("/");

      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Good hair days, booked in seconds.",
      );

      for (const service of services) {
        await expect(
          page.getByRole("heading", { level: 3, name: service }),
        ).toBeVisible();
      }

      await expect(page.getByRole("link", { name: "Book Now" }).first()).toBeVisible();
    });

    test("has no horizontal scrollbar", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test(
      viewport.stickyBarVisible
        ? "shows the sticky Book Now bar pinned to the bottom"
        : "hides the sticky Book Now bar",
      async ({ page }) => {
        await page.goto("/");
        const bar = page.getByTestId("sticky-book-bar");

        if (!viewport.stickyBarVisible) {
          await expect(bar).toBeHidden();
          return;
        }

        await expect(bar).toBeVisible();
        const box = await bar.boundingBox();
        expect(box).not.toBeNull();
        expect(viewport.height - (box!.y + box!.height)).toBeLessThanOrEqual(21);
      },
    );

    test("keeps the header on screen when the page is scrolled", async ({
      page,
    }) => {
      await page.goto("/");
      await page.mouse.wheel(0, 1200);
      await expect(page.locator("header")).toBeInViewport();
      const box = await page.locator("header").boundingBox();
      expect(box!.y).toBeLessThanOrEqual(1);
    });
  });
}

test("selecting a service moves the selected state", async ({ page }) => {
  await page.goto("/");

  if (services.length < 2) {
    test.skip();
  }

  const first = page.getByRole("article").filter({ hasText: services[0] });
  const second = page.getByRole("article").filter({ hasText: services[1] });

  await expect(first.getByRole("button", { name: "Selected" })).toBeVisible();
  await expect(second.getByRole("button", { name: "Select" })).toBeVisible();

  await second.getByRole("button", { name: "Select" }).click();

  await expect(second.getByRole("button", { name: "Selected" })).toBeVisible();
  await expect(first.getByRole("button", { name: "Select" })).toBeVisible();
});