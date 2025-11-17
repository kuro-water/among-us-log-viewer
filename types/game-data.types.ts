// Type definitions for Among Us game data (JSONL format, schema version 2.0.0)

export interface GameSchema {
  version: string;
  generated_at: string;
  game_id: string;
  game_count: number;
  movement_snapshot_interval_seconds: number;
}

export interface Match {
  start_time: string;
  end_time: string;
  duration_seconds: number;
  game_mode: string;
  map_name: string;
  player_count: number;
  impostor_count: number;
  winner_team: string;
}

export interface Settings {
  mod_version: string;
  among_us_version: string;
  host_player_id: number;
  host_name: string;
  kill_cooldown: number;
  discussion_time: number;
  voting_time: number;
  emergency_meetings: number;
  common_tasks: number;
  long_tasks: number;
  short_tasks: number;
  player_speed: number;
  crewmate_vision: number;
  impostor_vision: number;
  task_bar_updates: string;
}

export interface PlayerIdentity {
  player_id: number;
  player_name: string;
  player_uuid: string;
  color_id: number;
  platform: string;
}

export interface PlayerRole {
  main_role: string;
  sub_roles: string[];
}

export interface PlayerLifecycle {
  is_dead: boolean;
  death_reason: string;
  time_alive_seconds: number;
  is_winner: boolean;
}

export interface PlayerProgression {
  tasks_completed: number;
  tasks_total: number;
  tasks_completed_events: number;
}

export interface PlayerCounters {
  movement_distance: number;
  emergency_button_uses: number;
  sabotages_triggered: number;
}

export interface PlayerAction {
  action_type: string;
  timestamp: string;
  time: string;
  target_player_id?: number;
  target_player_name?: string;
}

export interface TimeseriesRefs {
  movement_snapshots_key: string;
}

export interface PlayerData {
  identity: PlayerIdentity;
  role: PlayerRole;
  lifecycle: PlayerLifecycle;
  progression: PlayerProgression;
  counters: PlayerCounters;
  actions: PlayerAction[];
  timeseries_refs: TimeseriesRefs;
}

export interface Players {
  order: number[];
  data: Record<string, PlayerData>;
}

export interface GameEvent {
  event_type: string;
  category: string;
  timestamp: string;
  elapsed_time: number;
  player_id?: number;
  player_name?: string;
  target_player_id?: number;
  target_player_name?: string;
  total_tasks_completed?: number;
  sabotage_type?: string;
  meeting_type?: string;
}

export interface Events {
  timeline: GameEvent[];
}

export interface MovementSnapshot {
  t: number;
  x: number;
  y: number;
}

export interface Timeseries {
  movement_snapshots: Record<string, MovementSnapshot[]>;
}

export interface GameAnalytics {
  total_kills: number;
  total_tasks_completed: number;
  total_sabotages: number;
  total_meetings: number;
  crew_task_completion_rate: number;
}

export interface GameResult {
  winner_team: string;
  winning_players: string[];
  losing_players: string[];
  game_end_reason: string;
}

export interface GameData {
  schema: GameSchema;
  match: Match;
  settings: Settings;
  players: Players;
  events: Events;
  timeseries: Timeseries;
  analytics: GameAnalytics;
  result: GameResult;
}

// Helper types for data transformation
export type Faction = 'Crewmate' | 'Impostor' | 'Madmate' | 'Neutral' | 'Other';

export interface FactionWinRate {
  faction: Faction;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
}

export interface PlayerStats {
  playerName: string;
  playerUuid: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalTasks: number;
  totalDistance: number;
  averageTasksPerGame: number;
  averageDistancePerGame: number;
}

export interface HeatmapCell {
  x: number;
  y: number;
  value: number | null;
  playCount: number;
}

export interface HeatmapData {
  xAxis: string[];
  yAxis: string[];
  data: HeatmapCell[];
}

export interface RolePerformance {
  role: string;
  faction: Faction;
  totalGames: number;
  wins: number;
  winRate: number;
  averageTasks: number;
  averageSurvivalTime: number;
}
