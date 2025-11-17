'use client';

import { GameData } from '@/types/game-data.types';

interface Props {
  games: GameData[];
  selectedGameIndex: number;
  onSelectGame: (index: number) => void;
}

export default function GameSelector({ games, selectedGameIndex, onSelectGame }: Props) {
  return (
    <div className="mb-6">
      <label htmlFor="game-select" className="block text-sm font-medium mb-2">
        Select Game:
      </label>
      <select
        id="game-select"
        value={selectedGameIndex}
        onChange={(e) => onSelectGame(parseInt(e.target.value))}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
      >
        {games.map((game, index) => (
          <option key={index} value={index}>
            Game {index + 1}: {game.match.map_name} - {game.match.winner_team} wins
            ({new Date(game.match.start_time).toLocaleString()})
          </option>
        ))}
      </select>
    </div>
  );
}
