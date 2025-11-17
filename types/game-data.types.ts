// Type definitions for Among Us game data (Schema version 2.0.0)

export interface GameData {
  schema: Schema;
  match: Match;
  settings: Settings;
  players: Players;
  events: Events;
  timeseries: Timeseries;
  analytics: Analytics;
  outcome: Outcome;
}

export interface Schema {
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

export interface Players {
  order: number[];
  data: { [key: string]: PlayerData };
}

export interface PlayerData {
  identity: Identity;
  role: Role;
  lifecycle: Lifecycle;
  progression: Progression;
  counters: Counters;
  actions: Action[];
  timeseries_refs: TimeseriesRefs;
}

export interface Identity {
  player_id: number;
  player_name: string;
  player_uuid: string;
  color_id: number;
  platform: string;
}

export interface Role {
  main_role: string;
  sub_roles: string[];
}

export interface Lifecycle {
  is_dead: boolean;
  death_reason: string;
  time_alive_seconds: number;
  is_winner: boolean;
}

export interface Progression {
  tasks_completed: number;
  tasks_total: number;
  tasks_completed_events: number;
}

export interface Counters {
  movement_distance: number;
  emergency_button_uses: number;
  sabotages_triggered: number;
}

export interface Action {
  action_type: string;
  timestamp: string;
  time: string;
  sabotage_type?: string;
}

export interface TimeseriesRefs {
  movement_snapshots_key: string;
}

export interface Events {
  timeline: TimelineEvent[];
  meetings: Meeting[];
  kills: Kill[];
}

export interface TimelineEvent {
  event_type: string;
  category: string;
  timestamp: string;
  elapsed_time: number;
  player_id?: number;
  player_name?: string;
  total_tasks_completed?: number;
  sabotage_type?: string;
  total_sabotages?: number;
  killer_id?: number;
  killer_name?: string;
  victim_id?: number;
  victim_name?: string;
  death_reason?: string;
  button_count?: number;
  meeting_number?: number;
  reporter_id?: number;
  reporter_name?: string;
  is_emergency?: boolean;
  exiled_id?: number;
  exiled_name?: string;
  dead_body_id?: number | null;
}

export interface Meeting {
  meeting_number: number;
  time: string;
  reporter_id: number;
  reporter_name: string;
  is_emergency: boolean;
  dead_body_id: number | null;
  vote_results: { [key: string]: string };
  exiled_id: number | null;
  exiled_name: string | null;
}

export interface Kill {
  time: string;
  killer_id: number;
  killer_name: string;
  victim_id: number;
  victim_name: string;
  death_reason: string;
}

export interface Timeseries {
  movement_snapshots: { [key: string]: MovementSnapshot[] };
  snapshot_interval_seconds: number;
}

export interface MovementSnapshot {
  timestamp: string;
  elapsed_time: number;
  cumulative_distance: number;
  interval_distance: number;
}

export interface Analytics {
  overview: Overview;
  per_player_movement_distance: { [key: string]: number };
  per_player_time_alive: { [key: string]: number };
  per_player_tasks_completed: { [key: string]: number };
  per_player_sabotages: { [key: string]: number };
  per_player_emergency_buttons: { [key: string]: number };
}

export interface Overview {
  total_movement_distance: number;
  average_movement_distance: number;
  total_emergency_buttons: number;
  emergency_button_usage_rate: number;
  total_tasks_completed: number;
  total_sabotages: number;
  total_meetings: number;
  total_kills: number;
  average_time_alive: number;
  most_active_player: {
    player_id: number;
    player_name: string;
    action_count: number;
  };
  movement_statistics: {
    max_distance: number;
    min_distance: number;
  };
}

export interface Outcome {
  end_type: string;
  winner_team: string;
  winner_ids: number[];
  winner_roles: string[];
  additional_winner_roles: string[];
  game_count: number;
}

// Faction types
export type Faction = 'Crewmate' | 'Impostor' | 'Madmate' | 'Neutral' | 'Other';

// Chart data types
export interface FactionWinData {
  faction: Faction;
  wins: number;
  losses: number;
  games: number;
}

export interface HeatmapCell {
  x: number;
  y: number;
  value: number | null; // Win rate percentage (0-100) or null if no data
  playCount: number;
}

export interface HeatmapData {
  xAxis: string[]; // Player names
  yAxis: string[]; // Factions or roles
  data: HeatmapCell[];
}

export interface PlayerWinData {
  player_name: string;
  player_uuid: string;
  wins: number;
  losses: number;
  games: number;
}

export interface RolePerformanceData {
  role: string;
  faction: Faction;
  avg_tasks_completed: number;
  avg_time_alive: number;
  games_played: number;
}

export interface GameDurationData {
  duration_seconds: number;
  game_id: string;
}

export interface PlayerRadarData {
  player_name: string;
  kills: number;
  deaths: number;
  tasks_completed: number;
  movement_distance: number;
  sabotages: number;
}

export interface TaskTimelineData {
  timestamp: string;
  elapsed_time: number;
  total_tasks_completed: number;
}

export interface EventDensityData {
  time_bucket: number; // Time in seconds
  event_count: number;
}

export interface MovementWithEventsData {
  player_name: string;
  snapshots: {
    timestamp: string;
    elapsed_time: number;
    cumulative_distance: number;
  }[];
  events: {
    timestamp: string;
    elapsed_time: number;
    event_type: string;
    icon: string;
  }[];
}
