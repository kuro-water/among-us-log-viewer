import { GameData, MovementWithEventsData } from '@/types/game-data.types';
import { getEventIconName } from '@/lib/event-icons';

/**
 * Generate movement data with events for a specific player in a game
 */
export function generateMovementWithEvents(
  game: GameData,
  playerUuid: string
): MovementWithEventsData | null {
  // Find player
  const player = Object.values(game.players.data).find(
    p => p.identity.player_uuid === playerUuid
  );

  if (!player) {
    return null;
  }

  const playerId = player.identity.player_id;
  const playerName = player.identity.player_name;

  // Get movement snapshots
  const snapshotKey = player.timeseries_refs.movement_snapshots_key;
  const snapshots = game.timeseries.movement_snapshots[snapshotKey] || [];

  // Get events for this player
  const playerEvents = game.events.timeline
    .filter(event => {
      return (
        event.player_id === playerId ||
        event.killer_id === playerId ||
        event.victim_id === playerId
      );
    })
    .map(event => {
      let eventType = event.event_type;
      
      // Determine icon based on event
      const iconName = getEventIconName(
        event.event_type,
        event.sabotage_type
      );

      return {
        timestamp: event.timestamp,
        elapsed_time: event.elapsed_time,
        event_type: eventType,
        icon: iconName,
      };
    });

  return {
    player_name: playerName,
    snapshots: snapshots.map(s => ({
      timestamp: s.timestamp,
      elapsed_time: s.elapsed_time,
      cumulative_distance: s.cumulative_distance,
    })),
    events: playerEvents,
  };
}

/**
 * Generate movement with events for all players in a game
 */
export function generateAllPlayersMovementWithEvents(
  game: GameData
): MovementWithEventsData[] {
  const playerUuids = Object.values(game.players.data).map(
    p => p.identity.player_uuid
  );

  const data: MovementWithEventsData[] = [];
  playerUuids.forEach(uuid => {
    const playerData = generateMovementWithEvents(game, uuid);
    if (playerData) {
      data.push(playerData);
    }
  });

  return data;
}
