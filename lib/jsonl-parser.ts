import type { GameData } from '@/types/game-data.types';

/**
 * Parse JSONL (JSON Lines) file format
 * Each line contains one complete JSON object representing a single game
 */
export async function parseJSONL(filePath: string): Promise<GameData[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }

    const text = await response.text();
    const games: GameData[] = [];

    // Split by newline and parse each line
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
        // Continue processing other lines
      }
    }

    return games;
  } catch (error) {
    console.error('Error loading JSONL file:', error);
    throw error;
  }
}

/**
 * Load game data from the public directory
 */
export async function loadGameData(): Promise<GameData[]> {
  // For static export, the basePath is included in the fetch URL
  const basePath = process.env.NODE_ENV === 'production' ? '/among-us-log-viewer' : '';
  return parseJSONL(`${basePath}/game_history_sample.jsonl`);
}
