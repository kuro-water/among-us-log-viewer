import React from "react";
import { render, screen } from "@testing-library/react";
import { RoleWinRateChart } from "./RoleWinRateChart";
import type { RolePerformanceData } from "../../lib/data-transformers/types";
import { getFactionColorByRole, FACTION_COLORS } from "../../lib/role-mapping";
import { getFactionDisplayName } from "../../lib/role-localization";

jest.mock("highcharts-react-official");

describe("RoleWinRateChart stacked series", () => {
  it("renders win/loss mirrored bars and uses role color for wins", () => {
    const data: RolePerformanceData = {
      rows: [
        {
          role: "Crewmate",
          faction: "Crewmate",
          games: 3,
          wins: 1,
          winRate: 1 / 3,
          taskCompletionRate: 0,
          avgTimeAlive: 0,
        },
        {
          role: "Impostor",
          faction: "Impostor",
          games: 2,
          wins: 1,
          winRate: 1 / 2,
          taskCompletionRate: 0,
          avgTimeAlive: 0,
        },
      ],
    };

    render(<RoleWinRateChart data={data} />);

    const el = screen.getByTestId("highcharts-react");
    const json = el.getAttribute("data-options") || "{}";
    const options = JSON.parse(json);

    // Check chart type
    expect(options.chart.type).toBe("bar");

    // Now we render mirrored bars with one series per game layer
    // (maxGames layers should have been created)
    expect(options.series.length).toBe(3);

    // Each series data length equals number of categories (2 roles)
    options.series.forEach((s: any) => {
      expect(s.data.length).toBe(2);
    });

    // Validate win series uses role-colored points and negative values
    const sortedRoles = data.rows.slice().sort((a, b) => b.winRate - a.winRate);
    // series now represent per-game layers, names like "game-1", "game-2" ...

    // Each series corresponds to a layer: colors reflect wins/losses and
    // sign indicates winner/loser direction per game.
    options.series.forEach((s: any, layer: number) => {
      s.data.forEach((p: any, idx: number) => {
        const role = sortedRoles[idx];
        if (role.games <= layer) {
          expect(p.y).toBe(0);
        } else if (layer < (role.wins ?? 0)) {
          // win layer
          expect(p.y).toBeLessThanOrEqual(0);
          expect(p.color).toBe(getFactionColorByRole(role.role));
        } else {
          // loss layer
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.color).toBe("#e2e8f0");
        }
      });
    });

    // verify border settings to create gaps between stacked segments
    expect(options.plotOptions?.series?.borderColor).toBe("#ffffff");
    expect(options.plotOptions?.series?.borderWidth).toBe(2);
    expect(options.plotOptions?.series?.borderRadius).toBe(6);

    // Ensure category spacing values are as expected
    expect(options.plotOptions?.series?.groupPadding).toBeLessThanOrEqual(0.1);
    expect(options.plotOptions?.series?.pointPadding).toBeLessThanOrEqual(0.08);

    // Tooltip should no longer include "game-" series names — it should
    // only display wins/losses counts. Our mock serializes functions to
    // strings, so inspect the formatter code string.
    const formatterStr = options.tooltip?.formatter as string | undefined;
    expect(formatterStr).toBeDefined();
    expect(formatterStr).not.toMatch(/game-\d+/);
    // Should reference role/category so we can print it above counts
    expect(formatterStr).toMatch(/point\.category|this\.point/);
    // Should reference the characters for wins/losses
    expect(formatterStr).toMatch("勝");
    expect(formatterStr).toMatch("敗");

    // Stack labels should be HTML-enabled and include a nudging transform for
    // large percentages so the '%' doesn't overflow outside the chart area.
    const stackLabels = options.yAxis?.stackLabels;
    expect(stackLabels).toBeDefined();
    expect(stackLabels?.useHTML).toBe(true);
    const stackFormatter = stackLabels?.formatter as string | undefined;
    expect(stackFormatter).toBeDefined();
    expect(stackFormatter).toMatch(/translateX/);
  });

  it("renders a legend with the role names and colors", () => {
    const data: RolePerformanceData = {
      rows: [
        {
          role: "Crewmate",
          faction: "Crewmate",
          games: 3,
          winRate: 0.2,
          taskCompletionRate: 0,
          avgTimeAlive: 0,
          wins: 1,
        },
        {
          role: "Impostor",
          faction: "Impostor",
          games: 2,
          winRate: 0.5,
          taskCompletionRate: 0,
          avgTimeAlive: 0,
          wins: 1,
        },
      ],
    };

    render(<RoleWinRateChart data={data} />);

    const expected = [
      getFactionDisplayName("Crewmate" as any),
      getFactionDisplayName("Impostor" as any),
      getFactionDisplayName("Madmate" as any),
      getFactionDisplayName("Neutral" as any),
      getFactionDisplayName("Other" as any),
    ];
    const factionLegend = screen.getByTestId("faction-legend");
    const items = Array.from(factionLegend.children) as HTMLElement[];
    const texts = items.map((i) => i.textContent?.trim());

    expect(texts).toEqual(expect.arrayContaining(expected));
    // Check order
    expect(texts!.slice(0, expected.length)).toEqual(expected);

    const firstSwatch = items[0].querySelector("span") as HTMLElement;
    expect(firstSwatch).toHaveStyle(
      `background-color: ${FACTION_COLORS.Crewmate}`
    );

    // verify win/loss legend is present and ordered
    const winLossLegend = screen.getByTestId("winloss-legend");
    const winLossTexts = Array.from(winLossLegend.children).map((i) =>
      i.textContent?.trim()
    );
    expect(winLossTexts).toEqual(["勝利（役職色）", "敗北"]);

    // '勝利' swatch should not be the same as '敗北' and should have a border
    const firstWinSwatch = winLossLegend.children[0].querySelector(
      "span"
    ) as HTMLElement;
    const lossSwatch = winLossLegend.children[1].querySelector(
      "span"
    ) as HTMLElement;
    expect(firstWinSwatch).toHaveClass("border");
    // The loss swatch is grey
    expect(lossSwatch).toHaveStyle(`background-color: #e2e8f0`);
    // The win swatch should not be a plain grey block (it's transparent with border)
    expect(firstWinSwatch.style.backgroundColor).not.toBe(
      lossSwatch.style.backgroundColor
    );
  });
});
