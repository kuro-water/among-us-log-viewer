import { GameData, PlayerRadarData } from '@/types/game-data.types';

/**
 * Generate radar chart data for a specific player
 */
export function generatePlayerRadarData(games: GameData[], playerUuid: string): PlayerRadarData | null {
  let playerName = '';
  let totalKills = 0;
  let totalDeaths = 0;
  let totalTasksCompleted = 0;
  let totalMovementDistance = 0;
  let totalSabotages = 0;
  let gamesPlayed = 0;

  games.forEach(game => {
    const player = Object.values(game.players.data).find(
      p => p.identity.player_uuid === playerUuid
    );

    if (player) {
      playerName = player.identity.player_name;
      gamesPlayed++;

      // Count kills (look in events)
      const kills = game.events.kills.filter(k => k.killer_id === player.identity.player_id).length;
      totalKills += kills;

      // Count deaths
      if (player.lifecycle.is_dead) {
        totalDeaths++;
      }

      totalTasksCompleted += player.progression.tasks_completed;
      totalMovementDistance += player.counters.movement_distance;
      totalSabotages += player.counters.sabotages_triggered;
    }
  });

  if (gamesPlayed === 0) {
    return null;
  }

  return {
    player_name: playerName,
    kills: totalKills / gamesPlayed,
    deaths: totalDeaths / gamesPlayed,
    tasks_completed: totalTasksCompleted / gamesPlayed,
    movement_distance: totalMovementDistance / gamesPlayed,
    sabotages: totalSabotages / gamesPlayed,
  };
}

/**
 * Generate radar data for all players
 */
export function generateAllPlayersRadarData(games: GameData[]): PlayerRadarData[] {
  const playerUuids = new Set<string>();

  games.forEach(game => {
    Object.values(game.players.data).forEach(player => {
      playerUuids.add(player.identity.player_uuid);
    });
  });

  const radarData: PlayerRadarData[] = [];
  playerUuids.forEach(uuid => {
    const data = generatePlayerRadarData(games, uuid);
    if (data) {
      radarData.push(data);
    }
  });

  return radarData;
}
