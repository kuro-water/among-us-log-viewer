import { buildMovementWithEventsData } from "./movement-with-events";
import type { GameLog } from "../../types/game-data.types";

const baseGame: GameLog = {
  schema: {
    version: "1",
    generated_at: new Date().toISOString(),
    game_id: "g1",
    game_count: 1,
    movement_snapshot_interval_seconds: 5,
  },
  match: {
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    duration_seconds: 60,
    game_mode: "Standard",
    map_name: "TestMap",
    player_count: 2,
    impostor_count: 1,
    winner_team: "Crewmate",
  },
  settings: {
    mod_version: "1",
    among_us_version: "1",
    host_player_id: 0,
    host_name: "Alice",
    kill_cooldown: 20,
    discussion_time: 10,
    voting_time: 120,
    emergency_meetings: 1,
    common_tasks: 1,
    long_tasks: 1,
    short_tasks: 2,
    player_speed: 1,
    crewmate_vision: 1,
    impostor_vision: 1.5,
    task_bar_updates: "Always",
  },
  players: {
    order: [0, 1],
    data: {
      "0": {
        identity: {
          player_id: 0,
          player_name: "Alice",
          player_uuid: "A",
          color_id: 0,
          platform: "PC",
        },
        role: { main_role: "Crewmate", sub_roles: [] },
        lifecycle: {
          is_dead: false,
          death_reason: null,
          time_alive_seconds: 60,
          is_winner: true,
        },
        progression: {
          tasks_completed: 1,
          tasks_total: 1,
          tasks_completed_events: 1,
        },
        counters: {
          movement_distance: 10,
          emergency_button_uses: 0,
          sabotages_triggered: 0,
        },
        actions: [],
        timeseries_refs: { movement_snapshots_key: "1" },
      },
      "1": {
        identity: {
          player_id: 1,
          player_name: "Bob",
          player_uuid: "B",
          color_id: 1,
          platform: "PC",
        },
        role: { main_role: "Impostor", sub_roles: [] },
        lifecycle: {
          is_dead: true,
          death_reason: "Kill",
          time_alive_seconds: 30,
          is_winner: false,
        },
        progression: {
          tasks_completed: 0,
          tasks_total: 1,
          tasks_completed_events: 0,
        },
        counters: {
          movement_distance: 5,
          emergency_button_uses: 0,
          sabotages_triggered: 0,
        },
        actions: [],
        timeseries_refs: { movement_snapshots_key: "2" },
      },
    },
  },
  events: {
    timeline: [],
    meetings: [],
    kills: [],
  },
  timeseries: {
    movement_snapshots: {
      "1": [
        {
          timestamp: new Date().toISOString(),
          elapsed_time: 0,
          cumulative_distance: 0,
          interval_distance: 0,
        },
      ],
      "2": [
        {
          timestamp: new Date().toISOString(),
          elapsed_time: 0,
          cumulative_distance: 0,
          interval_distance: 0,
        },
      ],
    },
    snapshot_interval_seconds: 5,
  },
  analytics: {
    overview: {
      total_kills: 0,
      total_movement_distance: 0,
      average_movement_distance: 0,
      total_emergency_buttons: 0,
      emergency_button_usage_rate: 0,
      total_tasks_completed: 0,
      total_sabotages: 0,
      total_meetings: 0,
      average_time_alive: 0,
      movement_statistics: { max_distance: 0, min_distance: 0 },
    },
    per_player_movement_distance: {},
    per_player_time_alive: {},
    per_player_tasks_completed: {},
    per_player_sabotages: {},
    per_player_emergency_buttons: {},
  },
  outcome: {
    end_type: "Normal",
    winner_team: "Crewmate",
    winner_ids: [0],
    winner_roles: ["Crewmate"],
    additional_winner_roles: [],
    game_count: 1,
  },
};

describe("buildMovementWithEventsData", () => {
  it("includes kills from events.kills even when timeline has no kill entry", () => {
    const game = JSON.parse(JSON.stringify(baseGame)) as GameLog;
    // add a kill only in kills list
    const kill = {
      time: new Date().toISOString(),
      killer_id: 1,
      killer_name: "Bob",
      victim_id: 0,
      victim_name: "Alice",
      death_reason: "Kill",
    };
    game.events.kills = [kill];
    const result = buildMovementWithEventsData({
      games: [game],
      selectedGameIds: undefined,
    });
    expect(result).not.toBeNull();
    const events = result?.events ?? [];
    expect(events.some((e) => e.type === "Kill")).toBe(true);
  });

  it("does not duplicate kill if it exists both in timeline and kills list", () => {
    const game = JSON.parse(JSON.stringify(baseGame)) as GameLog;
    const timestamp = new Date().toISOString();
    const kill = {
      time: timestamp,
      killer_id: 1,
      killer_name: "Bob",
      victim_id: 0,
      victim_name: "Alice",
      death_reason: "Kill",
    };
    game.events.kills = [kill];
    // include same kill in timeline
    game.events.timeline = [
      {
        event_type: "Kill",
        category: "Combat",
        timestamp,
        elapsed_time: 10,
        killer_id: 1,
        killer_name: "Bob",
        victim_id: 0,
        victim_name: "Alice",
        death_reason: "Kill",
      } as any,
    ];
    const result = buildMovementWithEventsData({
      games: [game],
      selectedGameIds: undefined,
    });
    const events = result?.events ?? [];
    const killEvents = events.filter(
      (e) => e.type === "Kill" || e.label === "Kill"
    );
    expect(killEvents.length).toBe(1);
  });

  it("should include v2.1.0 events (VentMove, DoorClose, SabotageFix)", () => {
    const gameWithV21Events: GameLog = {
      ...baseGame,
      events: {
        timeline: [
          {
            event_type: "VentMove",
            category: "Movement",
            timestamp: new Date().toISOString(),
            elapsed_time: 10,
            player_id: 0,
            player_name: "P1",
          },
          {
            event_type: "DoorClose",
            category: "Sabotage",
            timestamp: new Date().toISOString(),
            elapsed_time: 20,
            player_id: 0,
            player_name: "P1",
          },
          {
            event_type: "SabotageFix",
            category: "Task",
            timestamp: new Date().toISOString(),
            elapsed_time: 30,
            player_id: 0,
            player_name: "P1",
          },
        ],
        meetings: [],
        kills: [],
      },
    };

    const result = buildMovementWithEventsData({
      games: [gameWithV21Events],
      selectedPlayerIds: new Set(["A"]),
    });

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.events).toHaveLength(3);
    expect(result.events.map((e) => e.type)).toEqual([
      "VentMove",
      "DoorClose",
      "SabotageFix",
    ]);
  });
});
