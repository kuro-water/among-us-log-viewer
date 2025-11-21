import type { Faction } from "./role-mapping";
import { FACTION_LABELS } from "@/config/factions";
import { ROLE_DISPLAY_NAMES } from "@/config/role-translations";

// 表示用の日本語ラベル
export const FACTION_DISPLAY_NAMES: Record<Faction, string> = FACTION_LABELS;

export function getFactionDisplayName(faction: Faction): string {
  return FACTION_DISPLAY_NAMES[faction] ?? faction;
}

// 役職の日本語対応マッピング — ROLE_NAMES_IN_LOGS.md に基づく（完全網羅）
// マッピングされていない場合は元の英語名を表示
export function getRoleDisplayName(role?: string | null): string {
  if (!role) return "";
  return ROLE_DISPLAY_NAMES[role] ?? role;
}
