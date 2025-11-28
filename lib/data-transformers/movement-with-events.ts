import type {
  EventTimelineEntry,
  GameLog,
  PlayerRecord,
} from "../../types/game-data.types";
import type {
  MovementWithEventsData,
  MovementWithEventsGameData,
  MovementWithEventsAllGamesData,
  TransformerOptions,
} from "./types";
import {
  applyCommonFilters,
  extractMoverSeries,
  getPlayerKey,
  getPlayerLabel,
} from "./utils";
import { resolveEventVisual } from "../event-icons";

const INTERESTING_EVENTS = new Set([
  "Kill",
  "Sabotage",
  "EmergencyButton",
  "Meeting",
  // v2.1.0 新イベントタイプ
  "VentMove",
  "DoorClose",
  "SabotageFix",
]);

function eventMatchesPlayers(
  lookup: Map<number, string>,
  filter: Set<string> | undefined,
  event: {
    player_id?: number;
    killer_id?: number;
    victim_id?: number;
    reporter_id?: number;
  }
) {
  if (!filter || filter.size === 0) {
    return true;
  }

  const related = [
    event.player_id,
    event.killer_id,
    event.victim_id,
    event.reporter_id,
  ].filter((value): value is number => typeof value === "number");

  if (related.length === 0) {
    return true;
  }

  return related.some((id) => {
    const uuid = lookup.get(id);
    return uuid ? filter.has(uuid) : false;
  });
}

export function buildMovementWithEventsData(
  options: TransformerOptions
): MovementWithEventsData | null {
  const games = applyCommonFilters(options);
  const targetGame = games[0];

  if (!targetGame) {
    return null;
  }

  const filter = options.selectedPlayerIds;
  const playerRecords = Object.values(
    targetGame.players.data
  ) as PlayerRecord[];
  const players = playerRecords.filter((record) => {
    if (!filter || filter.size === 0) {
      return true;
    }
    return filter.has(getPlayerKey(record));
  });

  const series = players
    .map((record) => {
      const data = extractMoverSeries(targetGame, record).map((snapshot) => ({
        x: snapshot.elapsed_time,
        y: snapshot.cumulative_distance,
      }));
      return {
        playerUuid: getPlayerKey(record),
        playerName: getPlayerLabel(record),
        data,
      };
    })
    .filter((entry) => entry.data.length > 0);

  const lookup = new Map<number, string>();
  playerRecords.forEach((record) => {
    lookup.set(record.identity.player_id, getPlayerKey(record));
  });

  const timeline = targetGame.events.timeline as EventTimelineEntry[];
  const killsList = targetGame.events.kills ?? [];

  // merge timeline and kills (if kills are not present in timeline), computing elapsed_time for kills
  const mergedEvents: EventTimelineEntry[] = [...timeline];
  const keySet = new Set<string>(
    timeline
      .map(
        (e) =>
          `${e.event_type}-${e.timestamp}-${e.killer_id ?? ""}-${
            e.victim_id ?? ""
          }`
      )
      .filter(Boolean)
  );

  const matchStart = new Date(targetGame.match.start_time).getTime();
  killsList.forEach((kill) => {
    const key = `Kill-${kill.time}-${kill.killer_id ?? ""}-${
      kill.victim_id ?? ""
    }`;
    if (keySet.has(key)) return; // already present in timeline
    keySet.add(key);
    const elapsedMs = new Date(kill.time).getTime() - matchStart;
    const elapsed = Number.isFinite(elapsedMs)
      ? Math.round(elapsedMs / 1000)
      : undefined;
    mergedEvents.push({
      event_type: "Kill",
      category: "Combat",
      timestamp: kill.time,
      elapsed_time: elapsed,
      killer_id: kill.killer_id,
      killer_name: kill.killer_name,
      victim_id: kill.victim_id,
      victim_name: kill.victim_name,
      death_reason: kill.death_reason,
    } as EventTimelineEntry);
  });

  const events = mergedEvents
    .filter((event) => INTERESTING_EVENTS.has(event.event_type ?? ""))
    .filter((event) => eventMatchesPlayers(lookup, filter, event))
    .map((event) => {
      const visual = resolveEventVisual(event);
      return {
        x: event.elapsed_time ?? 0,
        label: visual.label,
        color: visual.color,
        type: event.event_type ?? visual.key,
      };
    });

  return {
    series,
    events,
    durationSeconds: targetGame.match.duration_seconds ?? 0,
  };
}

/**
 * 1試合分の移動×イベントデータを構築する内部関数
 */
function buildGameMovementData(
  game: GameLog,
  filter: Set<string> | undefined
): MovementWithEventsGameData {
  const playerRecords = Object.values(game.players.data) as PlayerRecord[];
  const players = playerRecords.filter((record) => {
    if (!filter || filter.size === 0) {
      return true;
    }
    return filter.has(getPlayerKey(record));
  });

  const series = players
    .map((record) => {
      const data = extractMoverSeries(game, record).map((snapshot) => ({
        x: snapshot.elapsed_time,
        y: snapshot.cumulative_distance,
      }));
      return {
        playerUuid: getPlayerKey(record),
        playerName: getPlayerLabel(record),
        data,
      };
    })
    .filter((entry) => entry.data.length > 0);

  const lookup = new Map<number, string>();
  playerRecords.forEach((record) => {
    lookup.set(record.identity.player_id, getPlayerKey(record));
  });

  const timeline = game.events.timeline as EventTimelineEntry[];
  const killsList = game.events.kills ?? [];

  const mergedEvents: EventTimelineEntry[] = [...timeline];
  const keySet = new Set<string>(
    timeline
      .map(
        (e) =>
          `${e.event_type}-${e.timestamp}-${e.killer_id ?? ""}-${
            e.victim_id ?? ""
          }`
      )
      .filter(Boolean)
  );
  const matchStart = new Date(game.match.start_time).getTime();
  killsList.forEach((kill) => {
    const key = `Kill-${kill.time}-${kill.killer_id ?? ""}-${
      kill.victim_id ?? ""
    }`;
    if (keySet.has(key)) return; // already present
    keySet.add(key);
    const elapsedMs = new Date(kill.time).getTime() - matchStart;
    const elapsed = Number.isFinite(elapsedMs)
      ? Math.round(elapsedMs / 1000)
      : undefined;
    mergedEvents.push({
      event_type: "Kill",
      category: "Combat",
      timestamp: kill.time,
      elapsed_time: elapsed,
      killer_id: kill.killer_id,
      killer_name: kill.killer_name,
      victim_id: kill.victim_id,
      victim_name: kill.victim_name,
      death_reason: kill.death_reason,
    } as EventTimelineEntry);
  });

  const events = mergedEvents
    .filter((event) => INTERESTING_EVENTS.has(event.event_type ?? ""))
    .filter((event) => eventMatchesPlayers(lookup, filter, event))
    .map((event) => {
      const visual = resolveEventVisual(event);
      return {
        x: event.elapsed_time ?? 0,
        label: visual.label,
        color: visual.color,
        type: event.event_type ?? visual.key,
      };
    });

  return {
    gameId: game.schema.game_id,
    mapName: game.match.map_name ?? "Unknown",
    startTime: game.match.start_time ?? "",
    playerCount: playerRecords.length,
    series,
    events,
    durationSeconds: game.match.duration_seconds ?? 0,
  };
}

/**
 * 全試合の移動×イベントデータを構築する
 * 各試合ごとにメタデータ（マップ名、開始時刻、プレイヤー数）を含む
 */
export function buildMovementWithEventsAllGamesData(
  options: TransformerOptions
): MovementWithEventsAllGamesData {
  const games = applyCommonFilters(options);
  const filter = options.selectedPlayerIds;

  const gamesData = games.map((game) => buildGameMovementData(game, filter));

  return {
    games: gamesData,
  };
}
