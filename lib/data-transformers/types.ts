import type { GameLog } from "../../types/game-data.types";
import type { Faction } from "../role-mapping";

export type PlayerId = string;

export interface TransformerOptions {
  games: GameLog[];
  selectedGameIds?: Set<string>;
  selectedPlayerIds?: Set<PlayerId>;
}

export interface PlayerIdentitySummary {
  uuid: PlayerId;
  name: string;
  colorId: number;
  platform: string;
}

export interface FactionWinRateDatum {
  faction: Faction;
  wins: number;
  games: number;
  losses: number;
  winRate: number;
  color: string;
}

export interface FactionWinRateData {
  totalGames: number;
  breakdown: FactionWinRateDatum[];
}

export interface PlayerWinRateBreakdown {
  faction: Faction;
  wins: number;
  games: number;
}

export interface PlayerWinRateRoleBreakdown {
  role: string;
  wins: number;
  games: number;
}

export interface PlayerWinRateRow {
  uuid: PlayerId;
  name: string;
  wins: number;
  losses: number;
  games: number;
  winRate: number;
  factions: PlayerWinRateBreakdown[];
  roles: PlayerWinRateRoleBreakdown[];
}

export interface PlayerWinRateData {
  rows: PlayerWinRateRow[];
}

export interface HeatmapCell {
  x: number;
  y: number;
  value: number | null;
  playCount: number;
  wins: number;
  meta: {
    playerUuid: PlayerId;
    label: string;
    target: string;
  };
}

export interface HeatmapData {
  xAxis: string[];
  yAxis: string[];
  cells: HeatmapCell[];
}

export interface RolePerformanceRow {
  role: string;
  faction: Faction;
  games: number;
  winRate: number;
  avgTasks: number;
  avgTimeAlive: number;
}

export interface RolePerformanceData {
  rows: RolePerformanceRow[];
}

export interface GameDurationData {
  durations: number[];
}

export interface PlayerRadarMetric {
  label: string;
  value: number;
  max: number;
}

export interface PlayerRadarData {
  playerUuid: PlayerId;
  playerName: string;
  metrics: PlayerRadarMetric[];
}

export interface TimelinePoint {
  elapsedSeconds: number;
  totalTasksCompleted: number;
  playerName: string;
}

export interface TaskTimelineData {
  gameId: string;
  points: TimelinePoint[];
  taskTotal: number;
}

export interface EventDensityBucket {
  minute: number;
  categories: Record<string, number>;
}

export interface EventDensityData {
  buckets: EventDensityBucket[];
}

export interface MovementSeriesPoint {
  x: number;
  y: number;
}

export interface MovementSeries {
  playerUuid: PlayerId;
  playerName: string;
  data: MovementSeriesPoint[];
}

export interface EventMarkerPoint {
  x: number;
  label: string;
  color: string;
  type: string;
}

export interface MovementWithEventsData {
  series: MovementSeries[];
  events: EventMarkerPoint[];
  durationSeconds: number;
}
