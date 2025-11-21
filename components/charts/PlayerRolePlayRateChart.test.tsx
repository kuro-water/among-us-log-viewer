import React from "react";
import { render, screen } from "@testing-library/react";
import PlayerRolePlayRateChart from "./PlayerRolePlayRateChart";

jest.mock("highcharts-react-official");

function makePlayerRecord(
  id: number,
  uuid: string,
  name: string,
  mainRole: string
) {
  return {
    identity: {
      player_id: id,
      player_name: name,
      player_uuid: uuid,
      color_id: 0,
      platform: "pc",
    },
    role: { main_role: mainRole, sub_roles: [] },
    lifecycle: {
      is_dead: false,
      death_reason: null,
      time_alive_seconds: 0,
      is_winner: false,
    },
    progression: {
      tasks_completed: 0,
      tasks_total: 0,
      tasks_completed_events: 0,
    },
    counters: {
      movement_distance: 0,
      emergency_button_uses: 0,
      sabotages_triggered: 0,
    },
    actions: [],
    timeseries_refs: {},
  } as const;
}

function makeGame(id: string, players: ReturnType<typeof makePlayerRecord>[]) {
  return {
    schema: {
      version: "1",
      generated_at: new Date().toISOString(),
      game_id: id,
      game_count: 1,
      movement_snapshot_interval_seconds: 1,
    },
    match: {
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: 0,
      game_mode: "Standard",
      map_name: "Test",
      player_count: players.length,
      impostor_count: 1,
      winner_team: "Crewmate",
    },
    settings: {} as any,
    players: {
      order: players.map((p) => p.identity.player_id),
      data: Object.fromEntries(
        players.map((p) => [String(p.identity.player_id), p])
      ),
    },
    events: { timeline: [], meetings: [], kills: [] },
    timeseries: { movement_snapshots: {}, snapshot_interval_seconds: 1 },
    analytics: {} as any,
    outcome: {
      end_type: "normal",
      winner_team: "Crewmate",
      winner_ids: [],
      winner_roles: [],
      additional_winner_roles: [],
      game_count: 1,
    },
  } as any;
}

describe("PlayerRolePlayRateChart responsive settings", () => {
  it("includes responsive rules to reduce label font sizes on narrower charts", () => {
    const g = makeGame("g1", [
      makePlayerRecord(0, "u1", "Alice", "Crewmate"),
      makePlayerRecord(1, "u2", "Bob", "Impostor"),
    ]);

    render(<PlayerRolePlayRateChart options={{ games: [g] }} />);

    const charts = screen.getAllByTestId("highcharts-react");
    expect(charts.length).toBeGreaterThanOrEqual(1);

    const optsJson = charts[0].getAttribute("data-options") || "{}";
    const opts = JSON.parse(optsJson);

    expect(opts).toBeDefined();
    expect(opts.responsive).toBeDefined();
    expect(Array.isArray(opts.responsive.rules)).toBe(true);

    const rule720 = opts.responsive.rules.find(
      (r: any) => r.condition && r.condition.maxWidth === 720
    );
    const rule420 = opts.responsive.rules.find(
      (r: any) => r.condition && r.condition.maxWidth === 420
    );

    expect(rule720).toBeDefined();
    expect(rule420).toBeDefined();

    expect(
      rule720.chartOptions.plotOptions?.pie?.dataLabels?.[0]?.style?.fontSize
    ).toBe("0.65em");
    expect(
      rule420.chartOptions.plotOptions?.pie?.dataLabels?.[0]?.enabled
    ).toBe(false);
  });
});
