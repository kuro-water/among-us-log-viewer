import React from "react";
import { render, screen } from "@testing-library/react";
import PlayerRolePlayRateChart from "./PlayerRolePlayRateChart";

jest.mock("highcharts-react-official");

// Mock transformer to return a minimal deterministic dataset
jest.mock("../../lib/data-transformers/player-role-playrate", () => ({
  buildPlayerRolePlayRateData: () => ({
    rows: [
      {
        playerUuid: "p1",
        playerName: "Bob",
        totalGames: 3,
        data: [
          { role: "Crewmate", percent: 70, color: "#111" },
          { role: "Impostor", percent: 30, color: "#222" },
        ],
      },
    ],
  }),
}));

describe("PlayerRolePlayRateChart visual options", () => {
  it("uses the shared pie style (border/dataLabels distances, no connector)", () => {
    render(
      <PlayerRolePlayRateChart
        options={{ games: [], selectedGameIds: undefined }}
      />
    );

    const el = screen.getByTestId("highcharts-react");
    const json = el.getAttribute("data-options") || "{}";
    const options = JSON.parse(json);

    expect(options.plotOptions?.pie?.borderWidth).toBe(4);
    const firstLabel = options.plotOptions?.pie?.dataLabels?.[0];
    expect(firstLabel.distance).toBe(20);
    expect(firstLabel.connectorWidth).toBeUndefined();

    const secondLabel = options.plotOptions?.pie?.dataLabels?.[1];
    expect(secondLabel.distance).toBe(-30);
    expect(secondLabel.filter?.operator).toBe(">");
    expect(secondLabel.filter?.property).toBe("percentage");
    expect(secondLabel.filter?.value).toBe(8);
  });
});
