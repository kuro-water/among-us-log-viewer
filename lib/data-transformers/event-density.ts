import type { GameLog } from "../../types/game-data.types";
import type {
  EventDensityData,
  EventDensityBucket,
  TransformerOptions,
} from "./types";
import { applyCommonFilters, getPlayerKey } from "./utils";

const DEFAULT_CATEGORY = "Other";

type EventLookup = Map<number, string>;

function buildLookup(game: GameLog): EventLookup {
  const lookup = new Map<number, string>();
  Object.values(game.players.data).forEach((record) => {
    lookup.set(record.identity.player_id, getPlayerKey(record));
  });
  return lookup;
}

function eventMatchesFilter(
  playerFilter: Set<string> | undefined,
  lookup: EventLookup,
  event: {
    player_id?: number;
    killer_id?: number;
    victim_id?: number;
    reporter_id?: number;
  }
) {
  if (!playerFilter || playerFilter.size === 0) {
    return true;
  }

  const relatedIds = [
    event.player_id,
    event.killer_id,
    event.victim_id,
    event.reporter_id,
  ].filter((value): value is number => typeof value === "number");

  if (relatedIds.length === 0) {
    return true;
  }

  return relatedIds.some((id) => {
    const uuid = lookup.get(id);
    return uuid ? playerFilter.has(uuid) : false;
  });
}

function resolveCategory(eventCategory?: string, eventType?: string): string {
  if (eventType === "Kill") return "Combat";
  if (eventType === "EmergencyButton") return "Emergency";
  if (eventCategory === "MeetingControl") return "Emergency";
  if (eventCategory === "Meeting") return "Meeting";
  if (eventCategory === "Task") return "Task";
  if (eventCategory === "Sabotage") return "Sabotage";
  if (eventCategory === "Combat") return "Combat";
  return eventCategory ?? eventType ?? DEFAULT_CATEGORY;
}

export function buildEventDensityData(
  options: TransformerOptions
): EventDensityData {
  const games = applyCommonFilters(options);
  const buckets = new Map<number, EventDensityBucket>();

  games.forEach((game) => {
    const lookup = buildLookup(game);
    game.events.timeline.forEach((event) => {
      if (!eventMatchesFilter(options.selectedPlayerIds, lookup, event)) {
        return;
      }

      const minute = Math.floor((event.elapsed_time ?? 0) / 60);
      const key = resolveCategory(event.category, event.event_type);
      const bucket = buckets.get(minute) ?? { minute, categories: {} };
      bucket.categories[key] = (bucket.categories[key] ?? 0) + 1;
      buckets.set(minute, bucket);
    });
  });

  const ordered = Array.from(buckets.values()).sort(
    (a, b) => a.minute - b.minute
  );

  return { buckets: ordered };
}
