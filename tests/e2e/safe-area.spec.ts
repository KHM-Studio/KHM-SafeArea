import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __khmSetVisualViewportHeight(height: number): void;
  }
}

async function installVisualViewportMock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    class TestVisualViewport extends EventTarget {
      private currentHeight: number | undefined;
      offsetTop = 0;
      offsetLeft = 0;
      pageTop = 0;
      pageLeft = 0;
      scale = 1;

      get width(): number {
        return window.innerWidth;
      }

      get height(): number {
        return this.currentHeight ?? window.innerHeight;
      }

      setHeight(height: number): void {
        this.currentHeight = height;
      }
    }

    const viewport = new TestVisualViewport();
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: viewport
    });
    window.__khmSetVisualViewportHeight = (height: number) => {
      viewport.setHeight(height);
      viewport.dispatchEvent(new Event("resize"));
    };
  });
}

test.beforeEach(async ({ page }) => {
  await installVisualViewportMock(page);
});

test("renders the packaged API without console or layout failures", async ({ page }, testInfo) => {
  const consoleProblems: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) consoleProblems.push(message.text());
  });
  page.on("pageerror", (error) => consoleProblems.push(error.message));

  await page.goto("/");
  await expect(page).toHaveTitle("KHM SafeArea browser fixture");
  await expect(page.getByRole("heading", { name: "Browser validation" })).toBeVisible();
  await expect(page.locator("khm-safe-area")).toHaveClass(/consumer-shell/);
  await expect(page.locator("khm-safe-area")).toHaveClass(/khm-safe-top/);
  await expect(page.locator("khm-safe-area")).toHaveClass(/khm-safe-bottom/);
  await expect(page.locator("html")).toHaveCSS("--khm-keyboard-open", "0");

  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    viewportHeight: getComputedStyle(document.documentElement).getPropertyValue(
      "--khm-viewport-height"
    )
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.viewportHeight).toMatch(/^\d+(\.\d+)?px$/);

  await page.locator("khm-safe-area").evaluate((element) => element.setAttribute("x", ""));
  await expect(page.locator("khm-safe-area")).toHaveClass(/khm-safe-x/);

  if (testInfo.project.name === "mobile-chrome") {
    const baseline = await page.evaluate(() => window.visualViewport?.height ?? window.innerHeight);
    await page.getByLabel("Message").click();
    await page.evaluate(() => window.__khmSetVisualViewportHeight(480));
    await expect(page.locator("html")).toHaveCSS("--khm-keyboard-open", "1");
    await expect(page.locator("html")).toHaveCSS(
      "--khm-keyboard-height",
      `${Math.round(baseline - 480)}px`
    );
    await expect(page.getByLabel("Message")).toBeFocused();
  }

  expect(consoleProblems).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("validated.png"), fullPage: false });
});
