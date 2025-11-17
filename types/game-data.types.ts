export type Timestamp = string;

export interface GameSchema {
  version: string;
  generated_at: Timestamp;
  game_id: string;
  game_count: number;
  movement_snapshot_interval_seconds: number;
}

export interface GameMatch {
  start_time: Timestamp;
  end_time: Timestamp;
  duration_seconds: number;
  game_mode: string;
  map_name: string;
  player_count: number;
  impostor_count: number;
  winner_team: string;
}

export interface GameSettings {
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
  [key: string]: string | number;
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
  death_reason: string | null;
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
  [key: string]: number;
}

export interface PlayerAction {
  action_type: string;
  timestamp: Timestamp;
  time?: Timestamp;
  sabotage_type?: string;
  button_count?: number;
  meeting_number?: number;
  is_emergency?: boolean;
  elapsed_time?: number;
  killer_id?: number;
  killer_name?: string;
  victim_id?: number;
  victim_name?: string;
  death_reason?: string;
  total_tasks_completed?: number;
  total_sabotages?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface TimeseriesRefs {
  movement_snapshots_key?: string;
}

export interface PlayerRecord {
  identity: PlayerIdentity;
  role: PlayerRole;
  lifecycle: PlayerLifecycle;
  progression: PlayerProgression;
  counters: PlayerCounters;
  actions: PlayerAction[];
  timeseries_refs: TimeseriesRefs;
}

export interface PlayersSection {
  order: number[];
  data: Record<string, PlayerRecord>;
}

export interface EventTimelineEntry {
  event_type: string;
  category: string;
  timestamp: Timestamp;
  elapsed_time?: number;
  player_id?: number;
  player_name?: string;
  total_tasks_completed?: number;
  sabotage_type?: string;
  total_sabotages?: number;
  button_count?: number;
  meeting_number?: number;
  reporter_id?: number;
  reporter_name?: string;
  is_emergency?: boolean;
  exiled_id?: number | null;
  exiled_name?: string | null;
  killer_id?: number;
  killer_name?: string;
  victim_id?: number;
  victim_name?: string;
  death_reason?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface MeetingEvent {
  meeting_number: number;
  time: Timestamp;
  reporter_id: number;
  reporter_name: string;
  is_emergency: boolean;
  dead_body_id: number | null;
  vote_results: Record<string, string>;
  exiled_id: number | null;
  exiled_name: string | null;
}

export interface KillEvent {
  time: Timestamp;
  killer_id: number;
  killer_name: string;
  victim_id: number;
  victim_name: string;
  death_reason: string;
}

export interface GameEvents {
  timeline: EventTimelineEntry[];
  meetings: MeetingEvent[];
  kills: KillEvent[];
}

export interface MovementSnapshot {
  timestamp: Timestamp;
  elapsed_time: number;
  cumulative_distance: number;
  interval_distance: number;
}

export interface TimeseriesSection {
  movement_snapshots: Record<string, MovementSnapshot[]>;
  snapshot_interval_seconds: number;
}

export interface OverviewAnalytics {
  total_movement_distance: number;
  average_movement_distance: number;
  total_emergency_buttons: number;
  emergency_button_usage_rate: number;
  total_tasks_completed: number;
  total_sabotages: number;
  total_meetings: number;
  total_kills: number;
  average_time_alive: number;
  most_active_player?: {
    player_id: number;
    player_name: string;
    action_count: number;
  };
  movement_statistics?: {
    max_distance: number;
    min_distance: number;
  };
  [key: string]: number | Record<string, number> | undefined | object;
}

export interface GameAnalytics {
  overview: OverviewAnalytics;
  per_player_movement_distance: Record<string, number>;
  per_player_time_alive: Record<string, number>;
  per_player_tasks_completed: Record<string, number>;
  per_player_sabotages: Record<string, number>;
  per_player_emergency_buttons: Record<string, number>;
}

export interface GameOutcome {
  end_type: string;
  winner_team: string;
  winner_ids: number[];
  winner_roles: string[];
  additional_winner_roles: string[];
  game_count: number;
}

export interface GameLog {
  schema: GameSchema;
  match: GameMatch;
  settings: GameSettings;
  players: PlayersSection;
  events: GameEvents;
  timeseries: TimeseriesSection;
  analytics: GameAnalytics;
  outcome: GameOutcome;
}

export type GameLogCollection = GameLog[];
