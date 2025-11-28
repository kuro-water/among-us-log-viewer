import React from "react";
import { render, screen } from "@testing-library/react";

// Mock the Highcharts React wrapper
jest.mock("highcharts-react-official");
jest.mock("animejs");

import { MovementWithEventsChart } from "./MovementWithEventsChart";
import type { MovementWithEventsAllGamesData } from "../../lib/data-transformers/types";

describe("MovementWithEventsChart layout", () => {
  it("applies bottom padding to the chart wrapper when data is present", () => {
    const oneGame: MovementWithEventsAllGamesData = {
      games: [
        {
          gameId: "g1",
          mapName: "TestMap",
          startTime: new Date().toISOString(),
          playerCount: 4,
          durationSeconds: 60,
          series: [
            {
              playerUuid: "p1",
              playerName: "Player1",
              data: [
                { x: 0, y: 0 },
                { x: 60, y: 100 },
              ],
            },
          ],
          events: [],
        },
      ],
    };

    render(<MovementWithEventsChart allGamesData={oneGame} className="h-95" />);

    const wrapper = screen.getByTestId("chart-wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.className.split(" ")).toContain("pb-10");
  });

  it("renders kill event into the scatter series", () => {
    const killGame: MovementWithEventsAllGamesData = {
      games: [
        {
          gameId: "g1",
          mapName: "TestMap",
          startTime: new Date().toISOString(),
          playerCount: 2,
          durationSeconds: 60,
          series: [
            {
              playerUuid: "p1",
              playerName: "Player1",
              data: [
                { x: 0, y: 0 },
                { x: 60, y: 100 },
              ],
            },
          ],
          events: [{ x: 30, label: "Kill", color: "#e63946", type: "Kill" }],
        },
      ],
    };

    render(
      <MovementWithEventsChart allGamesData={killGame} className="h-95" />
    );
    const chart = screen.getByTestId("highcharts-react");
    const optionsStr = chart.getAttribute("data-options") ?? "";
    const opts = JSON.parse(optionsStr);
    const scatter = opts?.series?.find((s: any) => s.type === "scatter");
    expect(scatter).toBeDefined();
    const kills = scatter.data.filter((d: any) => d.custom?.label === "Kill");
    expect(kills.length).toBe(1);
  });

  it("applies bottom padding to the empty state when no movement data", () => {
    const gameNoMovement: MovementWithEventsAllGamesData = {
      games: [
        {
          gameId: "g2",
          mapName: "EmptyMap",
          startTime: new Date().toISOString(),
          playerCount: 2,
          durationSeconds: 60,
          series: [],
          events: [],
        },
      ],
    };

    render(
      <MovementWithEventsChart allGamesData={gameNoMovement} className="h-95" />
    );

    // Find the empty state message and assert its container has the padding class
    const empty = screen.getByText(/この試合には移動データがありません/i);
    expect(empty).toBeInTheDocument();
    const container = empty.closest("div");
    expect(container).toHaveClass("pb-10");
  });
});
