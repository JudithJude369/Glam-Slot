import { expect, test } from "@playwright/test";
import { getPublicTeamNames } from "./public-data";

const aboutHeading = "A little salon with a big heart.";

const viewports = [
  { name: "mobile", width: 375, height: 812, stickyBarVisible: true },
  { name: "tablet", width: 768, height: 1024, stickyBarVisible: false },
  { name: "desktop", width: 1280, height: 900, stickyBarVisible: false },
];

test.describe.configure({ mode: "serial" });

let team: string[] = [];

test.beforeAll(async () => {
  team = await getPublicTeamNames();
});

for (const viewport of viewports) {
  test.describe(`about at ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("shows the heading, the team names and a Book Now button", async ({
      page,
    }) => {
      const response = await page.goto("/about");

      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        aboutHeading,
      );

      for (const member of team) {
        await expect(page.getByText(member, { exact: true })).toBeVisible();
      }

      await expect(page.getByRole("link", { name: "Book Now" }).first()).toBeVisible();
    });

    test("has no horizontal scrollbar", async ({ page }) => {
      await page.goto("/about");
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
        await page.goto("/about");
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
      await page.goto("/about");
      await page.mouse.wheel(0, 1200);
      await expect(page.locator("header")).toBeInViewport();
      const box = await page.locator("header").boundingBox();
      expect(box!.y).toBeLessThanOrEqual(1);
    });
  });
}

test("marks About as the active nav link", async ({ page }) => {
  await page.goto("/about");
  const mainNav = page.getByRole("navigation", { name: "Main" });

  await expect(mainNav.getByRole("link", { name: "About" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(mainNav.getByRole("link", { name: "Home" })).not.toHaveAttribute(
    "aria-current",
    "page",
  );
});