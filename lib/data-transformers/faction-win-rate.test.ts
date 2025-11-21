import { buildFactionWinRateData } from "./faction-win-rate";
import type { GameLog } from "@/types/game-data.types";
import { FACTION_COLORS } from "@/config/factions";

function makePlayerRecord(
  id: number,
  uuid: string,
  name: string,
  mainRole: string,
  isWinner = false
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
      is_winner: isWinner,
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

function makeGame(
  id: string,
  winner: string,
  players: ReturnType<typeof makePlayerRecord>[]
) {
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
      winner_team: winner,
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
      winner_team: winner,
      winner_ids: [],
      winner_roles: [],
      additional_winner_roles: [],
      game_count: 1,
    },
  } as unknown as GameLog;
}

describe("buildFactionWinRateData", () => {
  it("counts games and wins by faction when multiple factions present", () => {
    const game1 = makeGame("g1", "Crewmate", [
      makePlayerRecord(1, "u1", "Alice", "Crewmate"),
      makePlayerRecord(2, "u2", "Bob", "Impostor"),
    ]);

    const game2 = makeGame("g2", "Impostor", [
      makePlayerRecord(3, "u3", "Charlie", "Impostor"),
    ]);

    const result = buildFactionWinRateData({ games: [game1, game2] });

    expect(result.totalGames).toBe(2);

    const crewmate = result.breakdown.find((b) => b.faction === "Crewmate");
    const impostor = result.breakdown.find((b) => b.faction === "Impostor");

    expect(crewmate).toBeDefined();
    expect(impostor).toBeDefined();

    // Crewmate appears in one game and won once
    expect(crewmate!.games).toBe(1);
    expect(crewmate!.wins).toBe(1);
    expect(crewmate!.winRate).toBeCloseTo(1.0);
    expect(crewmate!.color).toBe(FACTION_COLORS.Crewmate);

    // Impostor appears in both games (game1 and game2) and won once
    expect(impostor!.games).toBe(2);
    expect(impostor!.wins).toBe(1);
    expect(impostor!.winRate).toBeCloseTo(0.5);
    expect(impostor!.color).toBe(FACTION_COLORS.Impostor);
  });

  it("handles games with no players by attributing to Other faction", () => {
    const emptyGame = makeGame("g-empty", "Neutral", []);

    const result = buildFactionWinRateData({ games: [emptyGame] });
    const other = result.breakdown.find((b) => b.faction === "Other");
    expect(result.totalGames).toBe(1);
    expect(other).toBeDefined();
    expect(other!.games).toBe(1);
    // winner team is 'Neutral', so neutral wins should be incremented.
    const neutral = result.breakdown.find((b) => b.faction === "Neutral");
    expect(neutral).toBeDefined();
    expect(neutral!.wins).toBe(1);
  });

  it("respects selectedGameIds filter", () => {
    const g1 = makeGame("g1", "Crewmate", [
      makePlayerRecord(1, "u1", "A", "Crewmate"),
    ]);
    const g2 = makeGame("g2", "Impostor", [
      makePlayerRecord(2, "u2", "B", "Impostor"),
    ]);

    const result = buildFactionWinRateData({
      games: [g1, g2],
      selectedGameIds: new Set(["g2"]),
    });
    expect(result.totalGames).toBe(1);
    // Only the Impostor faction should be present
    expect(result.breakdown.length).toBeGreaterThanOrEqual(1);
    const impostor = result.breakdown.find((b) => b.faction === "Impostor");
    expect(impostor!.games).toBe(1);
    expect(impostor!.wins).toBe(1);
  });
});
