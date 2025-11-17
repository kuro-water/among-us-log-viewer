import type { GameLog } from "../../types/game-data.types";
import {
  FACTION_COLORS,
  getFactionFromWinnerTeam,
  getRoleFaction,
  type Faction,
} from "../role-mapping";
import type { FactionWinRateData, TransformerOptions } from "./types";
import { applyCommonFilters } from "./utils";

const FACTIONS: Faction[] = [
  "Crewmate",
  "Impostor",
  "Madmate",
  "Neutral",
  "Other",
];

interface FactionCounter {
  wins: number;
  games: number;
}

function initCounters(): Record<Faction, FactionCounter> {
  return FACTIONS.reduce((acc, faction) => {
    acc[faction] = { wins: 0, games: 0 };
    return acc;
  }, {} as Record<Faction, FactionCounter>);
}

function collectFactionsInGame(game: GameLog): Set<Faction> {
  const factions = new Set<Faction>();
  Object.values(game.players.data).forEach((record) => {
    factions.add(getRoleFaction(record.role.main_role));
  });
  if (factions.size === 0) {
    factions.add("Other");
  }
  return factions;
}

export function buildFactionWinRateData(
  options: TransformerOptions
): FactionWinRateData {
  const games = applyCommonFilters(options);
  const totals = initCounters();

  games.forEach((game) => {
    const factionsInGame = collectFactionsInGame(game);
    factionsInGame.forEach((faction) => {
      totals[faction].games += 1;
    });
    const winnerFaction = getFactionFromWinnerTeam(game.match.winner_team);
    totals[winnerFaction].wins += 1;
  });

  const breakdown = FACTIONS.map((faction) => {
    const data = totals[faction];
    const losses = Math.max(data.games - data.wins, 0);
    const winRate = data.games > 0 ? data.wins / data.games : 0;
    return {
      faction,
      wins: data.wins,
      games: data.games,
      losses,
      winRate,
      color: FACTION_COLORS[faction],
    };
  }).filter((item) => item.games > 0 || item.wins > 0);

  return {
    totalGames: games.length,
    breakdown,
  };
}
