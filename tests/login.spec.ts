import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];

for (const viewport of viewports) {
  test.describe(`login at ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("shows the email field, the password field and a sign-in button", async ({
      page,
    }) => {
      const response = await page.goto("/login");

      expect(response?.status()).toBe(200);

      const form = page.locator("form:visible");
      await expect(form.locator('input[type="email"]')).toBeVisible();
      await expect(form.locator('input[name="password"]')).toBeVisible();
      await expect(form.getByRole("button", { name: /sign in/i })).toBeVisible();
    });

    test("has no horizontal scrollbar", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator("form:visible")).toBeVisible();

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test("has no site header, footer or sticky book bar", async ({ page }) => {
      await page.goto("/login");

      await expect(page.locator("header")).toHaveCount(0);
      await expect(page.locator("footer")).toHaveCount(0);
      await expect(page.getByTestId("sticky-book-bar")).toHaveCount(0);
    });
  });
}

test("a signed-out visitor asking for the dashboard lands on the login page", async ({
  page,
}) => {
  await page.goto("/dashboard");

  expect(new URL(page.url()).pathname).toBe("/login");
});

test.describe("a failed sign-in", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows one generic error and no provider detail", async ({ page }) => {
    await page.goto("/login");

    const form = page.locator("form:visible");
    await form.locator('input[type="email"]').fill("nobody@glamslot.invalid");
    await form.locator('input[name="password"]').fill("wrong-password-here");
    await form.getByRole("button", { name: /sign in/i }).click();

    // Scoped to the form: Next renders an empty role="alert" route announcer.
    const alert = form.locator('p[role="alert"]');
    await expect(alert).toHaveText("Incorrect email or password.");
    await expect(form).not.toContainText(/credentials|sign_in|AuthApiError/i);
    await expect(form.locator('input[type="email"]')).toHaveClass(/border-danger/);
  });

  test("clears the password and keeps the typed email", async ({ page }) => {
    await page.goto("/login");

    const form = page.locator("form:visible");
    const email = form.locator('input[type="email"]');
    const password = form.locator('input[name="password"]');

    await email.fill("nobody@glamslot.invalid");
    await password.fill("wrong-password-here");
    await form.getByRole("button", { name: /sign in/i }).click();

    await expect(form.locator('p[role="alert"]')).toBeVisible();
    await expect(email).toHaveValue("nobody@glamslot.invalid");
    await expect(password).toHaveValue("");
  });
});

test("the password toggle has an accessible label and reveals the field", async ({
  page,
}) => {
  await page.goto("/login");

  const form = page.locator("form:visible");
  const password = form.locator('input[name="password"]');
  const toggle = form.getByRole("button", { name: "Show password" });

  await expect(password).toHaveAttribute("type", "password");
  await toggle.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(form.getByRole("button", { name: "Hide password" })).toBeVisible();
});