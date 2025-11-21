import { test, expect } from "@playwright/test";

test("Highcharts credits appear inside chart wrapper within a Card", async ({
  page,
}) => {
  // Ensure dev server is running at http://localhost:3000
  // Use the configured baseURL (can be overridden by PLAYWRIGHT_BASE_URL in CI)
  await page.goto("/");

  const wrapper = page.locator(".chart-wrapper").first();
  // Charts are rendered client-side; wait for the wrapper to appear and be visible
  await expect(wrapper).toBeVisible({ timeout: 15000 });

  const credits = wrapper.locator(".highcharts-credits").first();
  await expect(credits).toBeVisible();

  // boundingBox returns an object of { x, y, width, height }
  const wrapperBox = await wrapper.boundingBox();
  const creditsBox = await credits.boundingBox();

  // boundingBox() can return null if the element is not visible, but we already
  // asserted visibility using `toBeVisible`. Add non-null guards here to satisfy
  // TypeScript and make the intention explicit.
  expect(wrapperBox).not.toBeNull();
  expect(creditsBox).not.toBeNull();

  // Non-null assertion is OK because we performed visibility asserts above
  expect(creditsBox!.x).toBeGreaterThanOrEqual(wrapperBox!.x);
  // Allow a small placement tolerance (rendering may vary slightly across
  // platforms or fonts; tests shouldn't be flaky for a few pixels of variance)
  const TOLERANCE = 20; // pixels
  expect(creditsBox!.x + creditsBox!.width).toBeLessThanOrEqual(
    wrapperBox!.x + wrapperBox!.width + TOLERANCE
  );
  expect(creditsBox!.y).toBeGreaterThanOrEqual(wrapperBox!.y);
  expect(creditsBox!.y + creditsBox!.height).toBeLessThanOrEqual(
    wrapperBox!.y + wrapperBox!.height + TOLERANCE
  );
});
