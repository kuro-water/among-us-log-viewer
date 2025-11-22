export type Faction = "Crewmate" | "Impostor" | "Madmate" | "Neutral" | "Other";

export interface FactionConfig {
  color: string;
  label: string;
}

export const FACTION_CONFIG: Record<Faction, FactionConfig> = {
  Crewmate: { color: "#00bcd4", label: "クルーメイト" },
  Impostor: { color: "#e74c3c", label: "インポスター" },
  Madmate: { color: "#c0392b", label: "マッドメイト" },
  Neutral: { color: "#27ae60", label: "ニュートラル" },
  Other: { color: "#6c757d", label: "その他" },
};

export const FACTION_COLORS = Object.fromEntries(
  Object.entries(FACTION_CONFIG).map(([key, value]) => [key, value.color])
) as Record<Faction, string>;

export const FACTION_LABELS = Object.fromEntries(
  Object.entries(FACTION_CONFIG).map(([key, value]) => [key, value.label])
) as Record<Faction, string>;
