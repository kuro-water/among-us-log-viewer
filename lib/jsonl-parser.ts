import { GameData } from '@/types/game-data.types';

/**
 * Parse JSONL (JSON Lines) format data
 * Each line contains a complete JSON object representing one game
 */
export async function parseJSONL(url: string): Promise<GameData[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSONL file: ${response.statusText}`);
    }

    const text = await response.text();
    const games: GameData[] = [];

    // Split by newline and parse each line independently
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        continue;
      }

      try {
        const game = JSON.parse(line) as GameData;
        games.push(game);
      } catch (error) {
        console.warn(`Failed to parse line ${i + 1}:`, error);
        // Continue processing other lines even if one fails
      }
    }

    return games;
  } catch (error) {
    console.error('Error parsing JSONL:', error);
    throw error;
  }
}

/**
 * Load game data from the public directory
 */
export async function loadGameData(): Promise<GameData[]> {
  // Use relative path from basePath
  const url = '/among-us-log-viewer/game_history_sample.jsonl';
  return parseJSONL(url);
}
