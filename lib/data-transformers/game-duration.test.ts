import { buildGameDurationData } from "./game-duration";
import type { GameLog } from "@/types/game-data.types";

function makeGame(id: string, seconds: number): GameLog {
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
      duration_seconds: seconds,
      game_mode: "Standard",
      map_name: "Test",
      player_count: 0,
      impostor_count: 0,
      winner_team: null,
    },
    settings: {} as any,
    players: { order: [], data: {} },
    events: { timeline: [], meetings: [], kills: [] },
    timeseries: { movement_snapshots: {}, snapshot_interval_seconds: 1 },
    analytics: {} as any,
    outcome: {} as any,
  } as unknown as GameLog;
}

describe("buildGameDurationData", () => {
  it("aggregates into 3-minute bins", () => {
    const games = [
      // one game in 0-2min
      makeGame("g1", 60),
      // one game in 3-5min
      makeGame("g2", 200),
      // two games in 6-8min
      makeGame("g3", 400),
      makeGame("g4", 380),
    ];

    const result = buildGameDurationData({ games });

    // We expect bins of 3 minutes: 0, 3, ...
    const minutes = result.distribution.map((d) => d.minute);
    expect(minutes[0]).toBe(0);
    expect(minutes[1] % 3).toBe(0);
    // ensure we have at least two bins
    expect(minutes.length).toBeGreaterThanOrEqual(2);

    // smoothing should be applied; counts should not be exact integers in many cases
    // distribution should show 3-minute bins (0, 3, 6) and smoothing applied
    const hasFloat = result.distribution.some((d) => d.count % 1 !== 0);
    expect(hasFloat).toBe(true);
  });
});
