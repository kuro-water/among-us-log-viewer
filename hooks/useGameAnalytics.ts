import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameLog } from "@/types/game-data.types";
import { loadGameHistory, type JsonLineError } from "@/lib/jsonl-parser";
import {
  buildEventDensityData,
  buildFactionWinRateData,
  buildGameDurationData,
  buildMovementWithEventsData,
  buildPlayerFactionHeatmap,
  buildPlayerRoleHeatmap,
  buildPlayerWinRateData,
  buildRolePerformanceData,
  buildTaskTimelineData,
} from "@/lib/data-transformers";
import type {
  EventDensityData,
  FactionWinRateData,
  GameDurationData,
  HeatmapData,
  MovementWithEventsData,
  PlayerIdentitySummary,
  PlayerWinRateData,
  RolePerformanceData,
  TaskTimelineData,
  TransformerOptions,
} from "@/lib/data-transformers/types";
import { buildPlayerDirectory } from "@/lib/data-transformers/utils";

interface GameOption {
  value: string;
  label: string;
  mapName: string;
  startTime: string;
  durationSeconds: number;
  playerCount: number;
}

interface PlayerOption {
  value: string;
  label: string;
  colorId: number;
  platform: string;
}

interface FilterState {
  selectedGameIds: string[];
  selectedPlayerIds: string[];
  recentGamesCount: number | null;
}

interface FilterActions {
  setSelectedGameIds: (ids: string[]) => void;
  setSelectedPlayerIds: (ids: string[]) => void;
  setRecentGamesCount: (count: number | null) => void;
  resetFilters: () => void;
}

interface AnalyticsPayload {
  factionWinRate: FactionWinRateData;
  playerWinRate: PlayerWinRateData;
  playerFactionHeatmap: HeatmapData;
  playerRoleHeatmap: HeatmapData;
  rolePerformance: RolePerformanceData;
  gameDuration: GameDurationData;
  taskTimeline: TaskTimelineData | null;
  eventDensity: EventDensityData;
  movementWithEvents: MovementWithEventsData | null;
}

export interface UseGameAnalyticsResult {
  loading: boolean;
  error: Error | null;
  parserErrors: JsonLineError[];
  games: GameLog[];
  hasData: boolean;
  gameOptions: GameOption[];
  playerOptions: PlayerOption[];
  filters: FilterState & FilterActions;
  analytics: AnalyticsPayload;
  refresh: () => void;
}

function formatGameLabel(game: GameLog): string {
  const start = new Date(game.match.start_time);
  const dateLabel = Number.isNaN(start.getTime())
    ? game.match.start_time
    : start.toLocaleString("ja-JP", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  return `#${game.schema.game_count} ${game.match.map_name} · ${dateLabel}`;
}

function mapPlayerSummaryToOption(
  summary: PlayerIdentitySummary
): PlayerOption {
  return {
    value: summary.uuid,
    label: summary.name,
    colorId: summary.colorId,
    platform: summary.platform,
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : (error as Error)?.name === "AbortError";
}

export function useGameAnalytics(): UseGameAnalyticsResult {
  const [games, setGames] = useState<GameLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [parserErrors, setParserErrors] = useState<JsonLineError[]>([]);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [recentGamesCount, setRecentGamesCount] = useState<number | null>(null);

  const gameIdSet = useMemo(() => new Set(selectedGameIds), [selectedGameIds]);
  const playerIdSet = useMemo(
    () => new Set(selectedPlayerIds),
    [selectedPlayerIds]
  );

  // 直近 N 試合のフィルタリング
  const recentGameIds = useMemo(() => {
    if (recentGamesCount === null || recentGamesCount <= 0) return undefined;
    const recentIds = games
      .slice(-recentGamesCount)
      .map((game) => game.schema.game_id);
    return new Set(recentIds);
  }, [games, recentGamesCount]);

  const transformerOptions = useMemo<TransformerOptions>(
    () => ({
      games,
      selectedGameIds:
        gameIdSet.size > 0
          ? gameIdSet
          : recentGameIds && recentGameIds.size > 0
          ? recentGameIds
          : undefined,
      selectedPlayerIds: playerIdSet.size > 0 ? playerIdSet : undefined,
    }),
    [games, gameIdSet, playerIdSet, recentGameIds]
  );

  const playerDirectory = useMemo(() => buildPlayerDirectory(games), [games]);

  const gameOptions = useMemo<GameOption[]>(
    () =>
      games.map((game) => ({
        value: game.schema.game_id,
        label: formatGameLabel(game),
        mapName: game.match.map_name,
        startTime: game.match.start_time,
        durationSeconds: game.match.duration_seconds,
        playerCount: game.match.player_count,
      })),
    [games]
  );

  const playerOptions = useMemo<PlayerOption[]>(
    () =>
      Array.from(playerDirectory.values())
        .map(mapPlayerSummaryToOption)
        .sort((a, b) => a.label.localeCompare(b.label, "ja")),
    [playerDirectory]
  );

  const analytics = useMemo<AnalyticsPayload>(
    () => ({
      factionWinRate: buildFactionWinRateData(transformerOptions),
      playerWinRate: buildPlayerWinRateData(transformerOptions),
      playerFactionHeatmap: buildPlayerFactionHeatmap(transformerOptions),
      playerRoleHeatmap: buildPlayerRoleHeatmap(transformerOptions),
      rolePerformance: buildRolePerformanceData(transformerOptions),
      gameDuration: buildGameDurationData(transformerOptions),
      taskTimeline: buildTaskTimelineData(transformerOptions),
      eventDensity: buildEventDensityData(transformerOptions),
      movementWithEvents: buildMovementWithEventsData(transformerOptions),
    }),
    [transformerOptions]
  );

  const resetFilters = useCallback(() => {
    setSelectedGameIds([]);
    setSelectedPlayerIds([]);
    setRecentGamesCount(null);
  }, []);

  const executeLoad = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadGameHistory({ signal });
      setGames(result.games);
      setParserErrors(result.errors);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      setError(err as Error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    executeLoad(controller.signal);
    return () => controller.abort();
  }, [executeLoad]);

  const refresh = useCallback(() => {
    executeLoad();
  }, [executeLoad]);

  const filters: FilterState & FilterActions = {
    selectedGameIds,
    selectedPlayerIds,
    recentGamesCount,
    setSelectedGameIds,
    setSelectedPlayerIds,
    setRecentGamesCount,
    resetFilters,
  };

  return {
    loading,
    error,
    parserErrors,
    games,
    hasData: games.length > 0,
    gameOptions,
    playerOptions,
    filters,
    analytics,
    refresh,
  };
}
