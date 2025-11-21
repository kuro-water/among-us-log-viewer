import {
  getPlayerKey,
  getPlayerLabel,
  filterGamesByIds,
  buildPlayerDirectory,
  buildPlayerAggregates,
  pickPrimaryPlayer,
  extractMoverSeries,
  collectTaskEvents,
  applyCommonFilters,
} from "./utils";
import type {
  GameLog,
  PlayerRecord,
  EventTimelineEntry,
  MovementSnapshot,
} from "@/types/game-data.types";

function makePlayerRecord(overrides: Partial<PlayerRecord> = {}): PlayerRecord {
  const base: PlayerRecord = {
    identity: {
      player_id: 1,
      player_name: "Alice",
      player_uuid: "u1",
      color_id: 1,
      platform: "pc",
    },
    role: { main_role: "Crewmate", sub_roles: [] },
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
  };

  return { ...base, ...overrides } as PlayerRecord;
}

function makeGame(overrides: Partial<GameLog> = {}): GameLog {
  const defaultPlayer = makePlayerRecord();
  const base = {
    schema: {
      version: "1",
      generated_at: new Date().toISOString(),
      game_id: "g1",
      game_count: 1,
      movement_snapshot_interval_seconds: 1,
    },
    match: {
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: 0,
      game_mode: "Standard",
      map_name: "Test",
      player_count: 1,
      impostor_count: 0,
      winner_team: "Crewmate",
    },
    settings: {} as any,
    players: { order: [1], data: { "1": defaultPlayer } },
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
  } as unknown as GameLog;

  return { ...base, ...overrides } as GameLog;
}

describe("utils module", () => {
  describe("getPlayerKey / getPlayerLabel", () => {
    it("returns uuid for player key and label when present", () => {
      const rec = makePlayerRecord();
      expect(getPlayerKey(rec)).toBe("u1");
      expect(getPlayerLabel(rec)).toBe("Alice");
    });

    it("falls back to player-<id> when uuid is falsy and label to Unknown when absent", () => {
      const rec = makePlayerRecord({
        identity: {
          ...makePlayerRecord().identity,
          player_uuid: "",
          player_name: "",
        },
      });
      expect(getPlayerKey(rec)).toBe("player-1");
      expect(getPlayerLabel(rec)).toBe("Unknown");
    });
  });

  describe("filterGamesByIds / applyCommonFilters", () => {
    it("filters games when selected ids provided", () => {
      const g1 = makeGame({ schema: { ...makeGame().schema, game_id: "g1" } });
      const g2 = makeGame({ schema: { ...makeGame().schema, game_id: "g2" } });
      const filtered = filterGamesByIds([g1, g2], new Set(["g2"]));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].schema.game_id).toBe("g2");

      // applyCommonFilters is thin wrapper
      expect(
        applyCommonFilters({
          games: [g1, g2],
          selectedGameIds: new Set(["g1"]),
        })
      ).toHaveLength(1);
    });
  });

  describe("buildPlayerDirectory", () => {
    it("builds a map of unique player identities from multiple games", () => {
      const p1 = makePlayerRecord({
        identity: {
          ...makePlayerRecord().identity,
          player_uuid: "u1",
          player_name: "Alice",
        },
      });
      const p2 = makePlayerRecord({
        identity: {
          player_id: 2,
          player_name: "Bob",
          player_uuid: "u2",
          color_id: 2,
          platform: "pc",
        },
      });
      const g1 = makeGame({ players: { order: [1], data: { "1": p1 } } });
      const g2 = makeGame({ players: { order: [2], data: { "2": p2 } } });

      const dir = buildPlayerDirectory([g1, g2]);
      expect(dir.size).toBe(2);
      expect(dir.get("u1")!.name).toBe("Alice");
      expect(dir.get("u2")!.name).toBe("Bob");
    });

    it("uses fallback key when uuid falsy", () => {
      const p = makePlayerRecord({
        identity: {
          ...makePlayerRecord().identity,
          player_uuid: "",
          player_name: "",
        },
      });
      const g = makeGame({ players: { order: [1], data: { "1": p } } });
      const dir = buildPlayerDirectory([g]);
      // fallback key is player-<id>
      expect(Array.from(dir.keys())[0]).toBe("player-1");
    });
  });

  describe("buildPlayerAggregates / pickPrimaryPlayer", () => {
    it("aggregates player stats and respects player filter", () => {
      const p1 = makePlayerRecord({
        identity: {
          player_id: 1,
          player_name: "A",
          player_uuid: "u1",
          color_id: 1,
          platform: "pc",
        },
        lifecycle: { ...makePlayerRecord().lifecycle, is_winner: true },
        counters: {
          movement_distance: 10,
          emergency_button_uses: 1,
          sabotages_triggered: 0,
        },
      });
      const p2 = makePlayerRecord({
        identity: {
          player_id: 2,
          player_name: "B",
          player_uuid: "u2",
          color_id: 2,
          platform: "pc",
        },
        lifecycle: { ...makePlayerRecord().lifecycle, is_winner: false },
        counters: {
          movement_distance: 5,
          emergency_button_uses: 0,
          sabotages_triggered: 1,
        },
      });

      const g = makeGame({
        players: { order: [1, 2], data: { "1": p1, "2": p2 } },
        events: { timeline: [], meetings: [], kills: [] },
      });

      const aggs = buildPlayerAggregates([g]);
      expect(aggs.get("u1")!.wins).toBe(1);
      expect(aggs.get("u1")!.movementDistance).toBe(10);
      expect(aggs.get("u2")!.sabotagesTriggered).toBe(1);

      // filter to just u2
      const aggsFiltered = buildPlayerAggregates([g], new Set(["u2"]));
      expect(aggsFiltered.has("u1")).toBe(false);
      expect(aggsFiltered.has("u2")).toBe(true);

      const primary = pickPrimaryPlayer(aggs, new Set(["u2"]));
      expect(primary!.uuid).toBe("u2");
    });

    it("returns first aggregate when fallback filter empty or not found", () => {
      const p = makePlayerRecord();
      const g = makeGame({ players: { order: [1], data: { "1": p } } });
      const aggs = buildPlayerAggregates([g]);
      const chosen = pickPrimaryPlayer(aggs);
      expect(chosen).not.toBeNull();
    });
  });

  describe("extractMoverSeries / collectTaskEvents", () => {
    it("returns empty series when timeseries ref missing and returns series when present", () => {
      const player = makePlayerRecord({ timeseries_refs: {} });
      const g1 = makeGame({ players: { order: [1], data: { "1": player } } });
      expect(extractMoverSeries(g1, player)).toEqual([]);

      const snapshots: MovementSnapshot[] = [
        {
          timestamp: new Date().toISOString(),
          elapsed_time: 1,
          cumulative_distance: 10,
          interval_distance: 10,
        },
      ];
      const player2 = makePlayerRecord({
        identity: {
          ...makePlayerRecord().identity,
          player_uuid: "u2",
          player_id: 2,
        },
        timeseries_refs: { movement_snapshots_key: "k1" },
      });
      const g2 = makeGame({
        players: { order: [2], data: { "2": player2 } },
        timeseries: {
          movement_snapshots: { k1: snapshots },
          snapshot_interval_seconds: 1,
        },
      });

      expect(extractMoverSeries(g2, player2)).toEqual(snapshots);
    });

    it("collects task events from game timeline", () => {
      const taskEvent: EventTimelineEntry = {
        event_type: "TaskCompleted",
        category: "Task",
        timestamp: new Date().toISOString(),
        total_tasks_completed: 1,
        player_name: "Alice",
      } as any;
      const otherEvent: EventTimelineEntry = {
        event_type: "Kill",
        category: "Violence",
        timestamp: new Date().toISOString(),
      } as any;
      const g = makeGame({
        events: { timeline: [taskEvent, otherEvent], meetings: [], kills: [] },
      });
      const tasks = collectTaskEvents(g);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].event_type).toBe("TaskCompleted");
    });
  });
});
