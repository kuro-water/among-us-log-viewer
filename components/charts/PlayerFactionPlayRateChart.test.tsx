import React from "react";
import { render, screen } from "@testing-library/react";
import PlayerFactionPlayRateChart from "./PlayerFactionPlayRateChart";

jest.mock("highcharts-react-official");

// Mock transformer to return a minimal deterministic dataset
jest.mock("../../lib/data-transformers/player-faction-playrate", () => ({
  buildPlayerFactionPlayRateData: () => ({
    rows: [
      {
        playerUuid: "p1",
        playerName: "Alice",
        totalGames: 5,
        data: [
          { faction: "Crewmate", percent: 60, color: "#111" },
          { faction: "Impostor", percent: 40, color: "#222" },
        ],
      },
    ],
  }),
}));

describe("PlayerFactionPlayRateChart visual options", () => {
  it("uses the shared pie style (border/dataLabels distances, no connector)", () => {
    render(
      <PlayerFactionPlayRateChart
        options={{ games: [], selectedGameIds: undefined }}
      />
    );

    const el = screen.getByTestId("highcharts-react");
    const json = el.getAttribute("data-options") || "{}";
    const options = JSON.parse(json);

    expect(options.plotOptions?.pie?.borderWidth).toBe(4);
    const firstLabel = options.plotOptions?.pie?.dataLabels?.[0];
    expect(firstLabel.distance).toBe(20);
    // connectors shouldn't exist on the shared style
    expect(firstLabel.connectorWidth).toBeUndefined();

    const secondLabel = options.plotOptions?.pie?.dataLabels?.[1];
    expect(secondLabel.distance).toBe(-30);
    expect(secondLabel.filter?.operator).toBe(">");
    expect(secondLabel.filter?.property).toBe("percentage");
    expect(secondLabel.filter?.value).toBe(8);
  });
});
