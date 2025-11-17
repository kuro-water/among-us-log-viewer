import type {
  EventTimelineEntry,
  GameLog,
  MovementSnapshot,
  PlayerRecord,
} from "../../types/game-data.types";
import { getRoleFaction, type Faction } from "../role-mapping";
import type {
  PlayerId,
  PlayerIdentitySummary,
  TransformerOptions,
} from "./types";

export interface PlayerAggregate {
  uuid: PlayerId;
  name: string;
  colorId: number;
  platform: string;
  wins: number;
  losses: number;
  appearances: number;
  deaths: number;
  kills: number;
  factions: Record<Faction, { games: number; wins: number }>;
  roles: Record<string, { games: number; wins: number }>;
  tasksCompleted: number;
  movementDistance: number;
  emergencyButtons: number;
  sabotagesTriggered: number;
  timeAlive: number;
}

export function getPlayerKey(record: PlayerRecord): PlayerId {
  return record.identity.player_uuid || `player-${record.identity.player_id}`;
}

export function getPlayerLabel(record: PlayerRecord): string {
  return (
    record.identity.player_name || record.identity.player_uuid || "Unknown"
  );
}

export function filterGamesByIds(
  games: GameLog[],
  ids?: Set<string>
): GameLog[] {
  if (!ids || ids.size === 0) {
    return games;
  }

  return games.filter((game) => ids.has(game.schema.game_id));
}

export function buildPlayerDirectory(
  games: GameLog[]
): Map<PlayerId, PlayerIdentitySummary> {
  const directory = new Map<PlayerId, PlayerIdentitySummary>();

  games.forEach((game) => {
    Object.values(game.players.data).forEach((record) => {
      const key = getPlayerKey(record);
      if (!directory.has(key)) {
        directory.set(key, {
          uuid: key,
          name: getPlayerLabel(record),
          colorId: record.identity.color_id,
          platform: record.identity.platform,
        });
      }
    });
  });

  return directory;
}

function ensureFactionRecord(aggregate: PlayerAggregate, faction: Faction) {
  if (!aggregate.factions[faction]) {
    aggregate.factions[faction] = { games: 0, wins: 0 };
  }
}

function ensureRoleRecord(aggregate: PlayerAggregate, role: string) {
  if (!aggregate.roles[role]) {
    aggregate.roles[role] = { games: 0, wins: 0 };
  }
}

function createAggregate(record: PlayerRecord): PlayerAggregate {
  return {
    uuid: getPlayerKey(record),
    name: getPlayerLabel(record),
    colorId: record.identity.color_id,
    platform: record.identity.platform,
    wins: 0,
    losses: 0,
    appearances: 0,
    deaths: 0,
    kills: 0,
    factions: {
      Crewmate: { games: 0, wins: 0 },
      Impostor: { games: 0, wins: 0 },
      Madmate: { games: 0, wins: 0 },
      Neutral: { games: 0, wins: 0 },
      Other: { games: 0, wins: 0 },
    },
    roles: {},
    tasksCompleted: 0,
    movementDistance: 0,
    emergencyButtons: 0,
    sabotagesTriggered: 0,
    timeAlive: 0,
  };
}

function buildPlayerLookup(game: GameLog): Map<number, PlayerRecord> {
  const lookup = new Map<number, PlayerRecord>();
  Object.values(game.players.data).forEach((record) => {
    lookup.set(record.identity.player_id, record);
  });
  return lookup;
}

export function buildPlayerAggregates(
  games: GameLog[],
  playerFilter?: Set<PlayerId>
): Map<PlayerId, PlayerAggregate> {
  const aggregates = new Map<PlayerId, PlayerAggregate>();

  games.forEach((game) => {
    const lookup = buildPlayerLookup(game);

    Object.values(game.players.data).forEach((record) => {
      const key = getPlayerKey(record);
      if (playerFilter && playerFilter.size > 0 && !playerFilter.has(key)) {
        return;
      }

      const aggregate = aggregates.get(key) ?? createAggregate(record);
      aggregate.appearances += 1;
      aggregate.tasksCompleted += record.progression.tasks_completed;
      aggregate.movementDistance += record.counters.movement_distance ?? 0;
      aggregate.emergencyButtons += record.counters.emergency_button_uses ?? 0;
      aggregate.sabotagesTriggered += record.counters.sabotages_triggered ?? 0;
      aggregate.timeAlive += record.lifecycle.time_alive_seconds ?? 0;

      const faction = getRoleFaction(record.role.main_role);
      ensureFactionRecord(aggregate, faction);
      aggregate.factions[faction].games += 1;

      const roleName = record.role.main_role || "Unknown";
      ensureRoleRecord(aggregate, roleName);
      aggregate.roles[roleName].games += 1;

      if (record.lifecycle.is_winner) {
        aggregate.wins += 1;
        aggregate.factions[faction].wins += 1;
        aggregate.roles[roleName].wins += 1;
      } else {
        aggregate.losses += 1;
      }

      if (record.lifecycle.is_dead) {
        aggregate.deaths += 1;
      }

      aggregates.set(key, aggregate);
    });

    game.events.kills?.forEach((kill) => {
      const killer = lookup.get(kill.killer_id);
      if (!killer) {
        return;
      }
      const key = getPlayerKey(killer);
      if (playerFilter && playerFilter.size > 0 && !playerFilter.has(key)) {
        return;
      }
      const aggregate = aggregates.get(key);
      if (aggregate) {
        aggregate.kills += 1;
      }
    });
  });

  return aggregates;
}

export function pickPrimaryPlayer(
  aggregates: Map<PlayerId, PlayerAggregate>,
  fallbackFilter?: Set<PlayerId>
): PlayerAggregate | null {
  if (fallbackFilter && fallbackFilter.size > 0) {
    for (const id of fallbackFilter.values()) {
      const candidate = aggregates.get(id);
      if (candidate) {
        return candidate;
      }
    }
  }

  const [first] = aggregates.values();
  return first ?? null;
}

export function extractMoverSeries(
  game: GameLog,
  record: PlayerRecord
): MovementSnapshot[] {
  const key = record.timeseries_refs.movement_snapshots_key;
  if (!key) {
    return [];
  }
  return game.timeseries.movement_snapshots[key] ?? [];
}

export function collectTaskEvents(game: GameLog): EventTimelineEntry[] {
  return game.events.timeline.filter(
    (event) => event.event_type === "TaskCompleted"
  );
}

export function applyCommonFilters({
  games,
  selectedGameIds,
}: TransformerOptions): GameLog[] {
  return filterGamesByIds(games, selectedGameIds);
}
