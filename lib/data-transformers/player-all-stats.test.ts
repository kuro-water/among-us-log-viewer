import { buildPlayerAllStatsData } from './player-all-stats';
import { GameLog } from '../../types/game-data.types';

describe('buildPlayerAllStatsData v2.1.0 support', () => {
  const mockGameV21: GameLog = {
    schema: { version: '2.1.0', generated_at: '', game_id: '', game_count: 1, movement_snapshot_interval_seconds: 5 },
    match: { start_time: '', end_time: '', duration_seconds: 100, game_mode: 'Standard', map_name: 'TheSkeld', player_count: 1, impostor_count: 0, winner_team: 'Crewmate' },
    settings: {} as any,
    players: {
      order: [0],
      data: {
        0: {
          identity: { player_id: 0, player_name: 'TestPlayer', player_uuid: 'uuid-0', color_id: 0, platform: 'PC' },
          role: { main_role: 'Crewmate', sub_roles: [] },
          lifecycle: { is_dead: false, death_reason: 'etc', time_alive_seconds: 100, is_winner: true },
          progression: { tasks_completed: 0, tasks_total: 0, tasks_completed_events: 0 },
          counters: {
            movement_distance: 100,
            emergency_button_uses: 0,
            sabotages_triggered: 0,
            // New v2.1.0 fields
            sabotages_fixed: 5,
            vent_moves: 3,
            door_closes: 2,
            admin_use_seconds: 10.5,
            vital_use_seconds: 5.0,
            camera_use_seconds: 20.0
          },
          actions: [],
          timeseries_refs: {}
        }
      }
    },
    events: { timeline: [], meetings: [], kills: [] },
    timeseries: { movement_snapshots: {}, snapshot_interval_seconds: 5 },
    analytics: {
        overview: {} as any,
        per_player_movement_distance: {},
        per_player_time_alive: {},
        per_player_tasks_completed: {},
        per_player_sabotages: {},
        per_player_emergency_buttons: {}
    },
    outcome: { end_type: 'Normal', winner_team: 'Crewmate', winner_ids: [], winner_roles: [], additional_winner_roles: [], game_count: 1 }
  };

  it('should correctly aggregate v2.1.0 fields', () => {
    const result = buildPlayerAllStatsData({ games: [mockGameV21] });
    const playerStats = result.rows.find(p => p.uuid === 'uuid-0');

    expect(playerStats).toBeDefined();
    expect(playerStats?.sabotagesFix).toBe(5);
    expect(playerStats?.ventMoves).toBe(3);
    expect(playerStats?.doorCloses).toBe(2);
    expect(playerStats?.adminUseSeconds).toBe(10.5);
    expect(playerStats?.vitalUseSeconds).toBe(5.0);
    expect(playerStats?.cameraUseSeconds).toBe(20.0);
  });

  it('should handle mixed v2.0.0 and v2.1.0 games', () => {
    const mockGameV20: GameLog = {
        ...mockGameV21,
        schema: { ...mockGameV21.schema, version: '2.0.0' },
        players: {
            order: [0],
            data: {
                0: {
                    ...mockGameV21.players.data[0],
                    counters: {
                        movement_distance: 50,
                        emergency_button_uses: 0,
                        sabotages_triggered: 0
                        // Missing v2.1.0 fields
                    }
                }
            }
        }
    };

    const result = buildPlayerAllStatsData({ games: [mockGameV21, mockGameV20] });
    const playerStats = result.rows.find(p => p.uuid === 'uuid-0');

    expect(playerStats).toBeDefined();
    // Sum of v2.1 (5) + v2.0 (undefined -> 0) = 5
    expect(playerStats?.sabotagesFix).toBe(5);
    // Sum of v2.1 (3) + v2.0 (undefined -> 0) = 3
    expect(playerStats?.ventMoves).toBe(3);
    
    // Check standard field aggregation
    expect(playerStats?.movementDistance).toBe(150); // 100 + 50
  });
});
