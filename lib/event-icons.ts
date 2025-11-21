import type { EventTimelineEntry } from "../types/game-data.types";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Flame,
  MessageCircle,
  Radiation,
  Radio,
  Shield,
  Skull,
  Wind,
  Zap,
} from "lucide-react";

export type EventVisualKey =
  | "Reactor"
  | "O2"
  | "Lights"
  | "Communications"
  | "CrashCourse"
  | "Mushroom"
  | "Door"
  | "Kill"
  | "Task"
  | "Meeting"
  | "Emergency"
  | "Default";

const ICON_MAP: Record<EventVisualKey, LucideIcon> = {
  Reactor: Radiation,
  O2: Wind,
  Lights: Zap,
  Communications: Radio,
  CrashCourse: AlertTriangle,
  Mushroom: Flame,
  Door: Shield,
  Kill: Skull,
  Task: CheckCircle,
  Meeting: MessageCircle,
  Emergency: Bell,
  Default: MessageCircle,
};

const COLOR_MAP: Record<EventVisualKey, string> = {
  Reactor: "#ff4d6d",
  O2: "#00b4d8",
  Lights: "#f9a826",
  Communications: "#4cc9f0",
  CrashCourse: "#c77dff",
  Mushroom: "#ffafcc",
  Door: "#adb5bd",
  Kill: "#e63946",
  Task: "#2ec4b6",
  Meeting: "#ffd60a",
  Emergency: "#f94144",
  Default: "#94a3b8",
};

const SABOTAGE_PATTERNS: Array<{ pattern: RegExp; key: EventVisualKey }> = [
  { pattern: /reactor|meltdown/i, key: "Reactor" },
  { pattern: /o2/i, key: "O2" },
  { pattern: /light/i, key: "Lights" },
  { pattern: /comm|communication/i, key: "Communications" },
  { pattern: /crash/i, key: "CrashCourse" },
  { pattern: /mushroom/i, key: "Mushroom" },
  { pattern: /door/i, key: "Door" },
];

const CATEGORY_DEFAULTS: Record<string, EventVisualKey> = {
  Task: "Task",
  Sabotage: "Reactor",
  Combat: "Kill",
  Meeting: "Meeting",
  MeetingControl: "Emergency",
};

export interface EventVisualDescriptor {
  key: EventVisualKey;
  icon: LucideIcon;
  color: string;
  label: string;
}

function resolveSabotageKey(sabotageType?: string): EventVisualKey | null {
  if (!sabotageType) {
    return null;
  }

  const match = SABOTAGE_PATTERNS.find(({ pattern }) =>
    pattern.test(sabotageType)
  );
  return match?.key ?? null;
}

function normalizeLabel(key: EventVisualKey): string {
  switch (key) {
    case "CrashCourse":
      return "Crash Course";
    case "O2":
      return "O2 Depletion";
    case "Door":
      return "Door Sabotage";
    case "Reactor":
      return "Reactor Meltdown";
    default:
      return key;
  }
}

export function resolveEventVisual(
  entry: EventTimelineEntry
): EventVisualDescriptor {
  const sabotageKey = resolveSabotageKey(entry.sabotage_type);
  const categoryKey = entry.category && CATEGORY_DEFAULTS[entry.category];
  let key: EventVisualKey = "Default";

  if (entry.event_type === "Kill") {
    key = "Kill";
  } else if (entry.event_type === "EmergencyButton") {
    key = "Emergency";
  } else if (entry.event_type === "Meeting") {
    key = "Meeting";
  } else if (entry.event_type === "TaskCompleted") {
    key = "Task";
  } else if (sabotageKey) {
    key = sabotageKey;
  } else if (categoryKey) {
    key = categoryKey;
  }

  return {
    key,
    icon: ICON_MAP[key],
    color: COLOR_MAP[key],
    label: normalizeLabel(key),
  };
}
