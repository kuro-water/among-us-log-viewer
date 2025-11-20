import { test, expect } from "@playwright/test";

test("Highcharts credits appear inside chart wrapper within a Card", async ({
  page,
}) => {
  // Ensure dev server is running at http://localhost:3000
  await page.goto("http://localhost:3000");

  const wrapper = page.locator(".chart-wrapper").first();
  await expect(wrapper).toBeVisible();

  const credits = wrapper.locator(".highcharts-credits").first();
  await expect(credits).toBeVisible();

  // boundingBox returns an object of { x, y, width, height }
  const wrapperBox = await wrapper.boundingBox();
  const creditsBox = await credits.boundingBox();

  expect(creditsBox.x).toBeGreaterThanOrEqual(wrapperBox.x);
  expect(creditsBox.x + creditsBox.width).toBeLessThanOrEqual(
    wrapperBox.x + wrapperBox.width
  );
  expect(creditsBox.y).toBeGreaterThanOrEqual(wrapperBox.y);
  expect(creditsBox.y + creditsBox.height).toBeLessThanOrEqual(
    wrapperBox.y + wrapperBox.height
  );
});
