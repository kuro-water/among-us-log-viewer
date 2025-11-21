import { Faction, FACTION_COLORS } from "@/config/factions";
import { ROLE_SETS, ROLE_FAMILIES } from "@/config/roles";

export type { Faction };
export { FACTION_COLORS, ROLE_FAMILIES };

const WINNER_TEAM_MAPPING: Record<string, Faction> = {
  Crewmate: "Crewmate",
  Crewmates: "Crewmate",
  Impostor: "Impostor",
  Impostors: "Impostor",
  Madmate: "Madmate",
  Madmates: "Madmate",
  Neutral: "Neutral",
  Neutrals: "Neutral",
  HideAndSeek: "Neutral",
};

export function getRoleFaction(mainRole?: string | null): Faction {
  const roleName = mainRole?.trim();
  if (!roleName) {
    return "Other";
  }

  const matchedEntry = (
    Object.entries(ROLE_SETS) as [Faction, Set<string>][]
  ).find(([, roleSet]) => roleSet.has(roleName));

  return matchedEntry ? matchedEntry[0] : "Other";
}

export function getFactionFromWinnerTeam(team?: string | null): Faction {
  if (!team) {
    return "Other";
  }

  return WINNER_TEAM_MAPPING[team] ?? "Other";
}

export function getFactionColorByRole(role?: string | null): string {
  return FACTION_COLORS[getRoleFaction(role)];
}

export function getFactionColor(faction: Faction): string {
  return FACTION_COLORS[faction];
}

export function getFactionAccentPalette(): string[] {
  return Object.values(FACTION_COLORS);
}
