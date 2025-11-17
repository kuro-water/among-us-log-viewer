export type Faction = "Crewmate" | "Impostor" | "Madmate" | "Neutral" | "Other";

const CREWMATE_ROLES = [
  "Crewmate",
  "Engineer",
  "Scientist",
  "Tracker",
  "Noisemaker",
  "Detective",
  "Bait",
  "Lighter",
  "Mayor",
  "SabotageMaster",
  "Sheriff",
  "Snitch",
  "SpeedBooster",
  "Trapper",
  "Dictator",
  "Doctor",
  "Seer",
  "TimeManager",
  "Gasp",
  "VentMaster",
  "ToiletFan",
  "Bakery",
  "FortuneTeller",
  "TaskStar",
  "PonkotuTeller",
  "UltraStar",
  "MeetingSheriff",
  "GuardMaster",
  "Shyboy",
  "Balancer",
  "ShrineMaiden",
  "Comebacker",
  "WhiteHacker",
  "WolfBoy",
  "NiceAddoer",
  "InSender",
  "Staff",
  "Efficient",
  "Psychic",
  "SwitchSheriff",
  "NiceLogger",
  "Android",
  "King",
  "AmateurTeller",
  "Cakeshop",
  "Snowman",
  "Stolener",
  "VentOpener",
  "VentHunter",
  "Walker",
  "CandleLighter",
  "Express",
  "Inspector",
  "AllArounder",
  "Observer",
  "Satellite",
  "Merlin",
];

const IMPOSTOR_ROLES = [
  "Impostor",
  "Shapeshifter",
  "Phantom",
  "Viper",
  "BountyHunter",
  "FireWorks",
  "Mafia",
  "SerialKiller",
  "ShapeMaster",
  "Sniper",
  "Vampire",
  "Witch",
  "Warlock",
  "Mare",
  "Penguin",
  "Puppeteer",
  "TimeThief",
  "EvilTracker",
  "Stealth",
  "NekoKabocha",
  "EvilHacker",
  "Insider",
  "Bomber",
  "TeleportKiller",
  "AntiReporter",
  "Tairou",
  "Evilgambler",
  "Notifier",
  "Magician",
  "Decrescendo",
  "Curser",
  "Alien",
  "AlienHijack",
  "SpeedStar",
  "EvilTeller",
  "Limiter",
  "ProgressKiller",
  "Mole",
  "EvilAddoer",
  "Reloader",
  "Jumper",
  "EarnestWolf",
  "Amnesiac",
  "Camouflager",
  "ConnectSaver",
  "EvilSatellite",
  "ProBowler",
  "EvilMaker",
  "Eraser",
  "QuickKiller",
  "CharismaStar",
  "Ballooner",
  "BorderKiller",
  "ShapeKiller",
  "Assassin",
];

const MADMATE_ROLES = [
  "MadGuardian",
  "Madmate",
  "MadSnitch",
  "MadAvenger",
  "SKMadmate",
  "MadJester",
  "MadTeller",
  "MadBait",
  "MadReduced",
  "MadWorker",
  "MadTracker",
  "MadChanger",
  "MadSuicide",
  "MadBetrayer",
  "Nue",
];

const NEUTRAL_ROLES = [
  "Arsonist",
  "Egoist",
  "Jester",
  "Opportunist",
  "PlagueDoctor",
  "SchrodingerCat",
  "Terrorist",
  "Executioner",
  "Jackal",
  "Remotekiller",
  "Chef",
  "JackalMafia",
  "CountKiller",
  "GrimReaper",
  "Madonna",
  "Jackaldoll",
  "Workaholic",
  "Monochromer",
  "DoppelGanger",
  "MassMedia",
  "Chameleon",
  "Banker",
  "BakeCat",
  "Emptiness",
  "JackalAlien",
  "CurseMaker",
  "PhantomThief",
  "Fox",
  "Turncoat",
  "Vulture",
  "SantaClaus",
  "Missioneer",
  "Strawdoll",
  "Fool",
  "TaskPlayerB",
];

const HIDE_AND_SEEK_ROLES = ["HASFox", "HASTroll"];

const OTHER_ROLES = ["GM", "Driver", "Braid", "Vega", "Altair"];

const ROLE_SETS: Record<Faction, Set<string>> = {
  Crewmate: new Set(CREWMATE_ROLES),
  Impostor: new Set(IMPOSTOR_ROLES),
  Madmate: new Set(MADMATE_ROLES),
  Neutral: new Set([...NEUTRAL_ROLES, ...HIDE_AND_SEEK_ROLES]),
  Other: new Set(OTHER_ROLES),
};

export const FACTION_COLORS: Record<Faction, string> = {
  Crewmate: "#00e272",
  Impostor: "#fe6a35",
  Madmate: "#9d4edd",
  Neutral: "#ffd60a",
  Other: "#6c757d",
};

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

  const matchedEntry = (Object.entries(ROLE_SETS) as [Faction, Set<string>][])
    .find(([, roleSet]) => roleSet.has(roleName));

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

export const ROLE_FAMILIES = {
  CREWMATE_ROLES,
  IMPOSTOR_ROLES,
  MADMATE_ROLES,
  NEUTRAL_ROLES,
  HIDE_AND_SEEK_ROLES,
  OTHER_ROLES,
};
