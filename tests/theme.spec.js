import { expect, test } from "@playwright/test";

async function openDemo(page, colorScheme = "light") {
  await page.emulateMedia({ colorScheme });
  await page.goto("/demo/");
  await page.waitForFunction(() =>
    document.querySelector(".remark-slides-area .remark-visible"),
  );
}

const theme = (page) =>
  page.evaluate(() => document.documentElement.getAttribute("data-theme"));

const storedTheme = (page) =>
  page.evaluate(() => localStorage.getItem("remark-theme"));

test("starts with the theme of the system", async ({ page }) => {
  await openDemo(page, "dark");
  expect(await theme(page)).toBe("dark");
  expect(await storedTheme(page)).toBeNull();

  await openDemo(page, "light");
  expect(await theme(page)).toBe("light");
});

test("the d key toggles the theme and remembers the choice", async ({
  page,
}) => {
  await openDemo(page, "light");
  await page.keyboard.press("d");
  expect(await theme(page)).toBe("dark");
  expect(await storedTheme(page)).toBe("dark");

  await page.reload();
  expect(await theme(page)).toBe("dark");

  await page.keyboard.press("D");
  expect(await theme(page)).toBe("light");
});

test("a manual choice wins over a system change", async ({ page }) => {
  await openDemo(page, "dark");
  await page.keyboard.press("d");
  expect(await theme(page)).toBe("light");

  const systemChanged = page.evaluate(
    () =>
      new Promise((resolve) =>
        matchMedia("(prefers-color-scheme: dark)").addEventListener(
          "change",
          resolve,
          { once: true },
        ),
      ),
  );
  await page.emulateMedia({ colorScheme: "light" });
  await systemChanged;
  expect(await theme(page)).toBe("light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => storedTheme(page)).toBe("light");
  expect(await theme(page)).toBe("light");
});

test("without a choice the theme follows the system", async ({ page }) => {
  await openDemo(page, "light");
  // The media query fires its change event asynchronously.
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => theme(page)).toBe("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => theme(page)).toBe("light");
});

test("reset forgets the choice", async ({ page }) => {
  await openDemo(page, "light");
  await page.keyboard.press("d");
  await page.evaluate(() => window.theme.reset());
  expect(await theme(page)).toBe("light");
  expect(await storedTheme(page)).toBeNull();
});

test("set rejects unknown themes", async ({ page }) => {
  await openDemo(page);
  await expect(page.evaluate(() => window.theme.set("sepia"))).rejects.toThrow(
    /unknown theme/,
  );
});

test("the key is ignored with a modifier", async ({ page }) => {
  await openDemo(page, "light");
  await page.keyboard.press("Alt+d");
  expect(await theme(page)).toBe("light");
});

test("the theme is applied before remark renders", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/demo/");
  // Read the attribute as soon as the plugin script ran, without waiting
  // for the slides.
  await page.waitForFunction(() => window.theme);
  expect(await theme(page)).toBe("dark");
});

test("the help screen lists the shortcut", async ({ page }) => {
  await openDemo(page);
  const row = page
    .locator(".remark-help-content tr")
    .filter({ hasText: "Toggle light / dark theme" });
  await expect(row.locator(".key")).toHaveText("d");
  await expect(page.locator(".remark-help-content tr").last()).toContainText(
    "Toggle this help",
  );
});

test("options change the key, the attribute and the storage key", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/tests/fixtures/options.html");
  await page.waitForFunction(() =>
    document.querySelector(".remark-slides-area .remark-visible"),
  );
  await expect(
    page.locator(".remark-help-content .remark-theme-help .key"),
  ).toHaveText("l");

  await page.keyboard.press("l");
  const state = await page.evaluate(() => ({
    scheme: document.documentElement.getAttribute("data-scheme"),
    stored: localStorage.getItem("my-deck-theme"),
    defaultKey: localStorage.getItem("remark-theme"),
  }));
  expect(state).toEqual({ scheme: "dark", stored: "dark", defaultKey: null });
});

test("fires an event on every change", async ({ page }) => {
  await openDemo(page, "light");
  await page.evaluate(() => {
    window.changes = [];
    document.documentElement.addEventListener("remark-theme-change", (e) =>
      window.changes.push(e.detail.theme),
    );
  });
  await page.keyboard.press("d");
  await page.keyboard.press("d");
  expect(await page.evaluate(() => window.changes)).toEqual(["dark", "light"]);
});
