import type {
  EventTimelineEntry,
  PlayerRecord,
} from "../../types/game-data.types";
import type { MovementWithEventsData, TransformerOptions } from "./types";
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
]);

function eventMatchesPlayers(
  lookup: Map<number, string>,
  filter: Set<string> | undefined,
  event: { player_id?: number; killer_id?: number; victim_id?: number; reporter_id?: number }
) {
  if (!filter || filter.size === 0) {
    return true;
  }

  const related = [event.player_id, event.killer_id, event.victim_id, event.reporter_id].filter(
    (value): value is number => typeof value === "number"
  );

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
  const playerRecords = Object.values(targetGame.players.data) as PlayerRecord[];
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
  const events = timeline
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
