import type { Faction } from '@/types/game-data.types';

// Crewmate faction roles (約50種類)
export const CREWMATE_ROLES = [
  'Crewmate',
  'Engineer',
  'Scientist',
  'Tracker',
  'Noisemaker',
  'Detective',
  'Bait',
  'Lighter',
  'Mayor',
  'SabotageMaster',
  'Sheriff',
  'Snitch',
  'SpeedBooster',
  'Trapper',
  'Dictator',
  'Doctor',
  'Seer',
  'TimeManager',
  'Gasp',
  'VentMaster',
  'ToiletFan',
  'Bakery',
  'FortuneTeller',
  'TaskStar',
  'PonkotuTeller',
  'UltraStar',
  'MeetingSheriff',
  'GuardMaster',
  'Shyboy',
  'Balancer',
  'ShrineMaiden',
  'Comebacker',
  'WhiteHacker',
  'WolfBoy',
  'NiceAddoer',
  'InSender',
  'Staff',
  'Efficient',
  'Psychic',
  'SwitchSheriff',
  'NiceLogger',
  'Android',
  'King',
  'AmateurTeller',
  'Cakeshop',
  'Snowman',
  'Stolener',
  'VentOpener',
  'VentHunter',
  'Walker',
  'CandleLighter',
  'Express',
  'Inspector',
  'AllArounder',
  'Observer',
  'Satellite',
  'Merlin',
] as const;

// Impostor faction roles (約50種類)
export const IMPOSTOR_ROLES = [
  'Impostor',
  'Shapeshifter',
  'Phantom',
  'Viper',
  'BountyHunter',
  'FireWorks',
  'Mafia',
  'SerialKiller',
  'ShapeMaster',
  'Sniper',
  'Vampire',
  'Witch',
  'Warlock',
  'Mare',
  'Penguin',
  'Puppeteer',
  'TimeThief',
  'EvilTracker',
  'Stealth',
  'NekoKabocha',
  'EvilHacker',
  'Insider',
  'Bomber',
  'TeleportKiller',
  'AntiReporter',
  'Tairou',
  'Evilgambler',
  'Notifier',
  'Magician',
  'Decrescendo',
  'Curser',
  'Alien',
  'AlienHijack',
  'SpeedStar',
  'EvilTeller',
  'Limiter',
  'ProgressKiller',
  'Mole',
  'EvilAddoer',
  'Reloader',
  'Jumper',
  'EarnestWolf',
  'Amnesiac',
  'Camouflager',
  'ConnectSaver',
  'EvilSatellite',
  'ProBowler',
  'EvilMaker',
  'Eraser',
  'QuickKiller',
  'CharismaStar',
  'Ballooner',
  'BorderKiller',
  'ShapeKiller',
  'Assassin',
] as const;

// Madmate faction roles (約15種類)
export const MADMATE_ROLES = [
  'MadGuardian',
  'Madmate',
  'MadSnitch',
  'MadAvenger',
  'SKMadmate',
  'MadJester',
  'MadTeller',
  'MadBait',
  'MadReduced',
  'MadWorker',
  'MadTracker',
  'MadChanger',
  'MadSuicide',
  'MadBetrayer',
  'Nue',
] as const;

// Neutral (third party) faction roles (約35種類)
export const NEUTRAL_ROLES = [
  'Arsonist',
  'Egoist',
  'Jester',
  'Opportunist',
  'PlagueDoctor',
  'SchrodingerCat',
  'Terrorist',
  'Executioner',
  'Jackal',
  'Remotekiller',
  'Chef',
  'JackalMafia',
  'CountKiller',
  'GrimReaper',
  'Madonna',
  'Jackaldoll',
  'Workaholic',
  'Monochromer',
  'DoppelGanger',
  'MassMedia',
  'Chameleon',
  'Banker',
  'BakeCat',
  'Emptiness',
  'JackalAlien',
  'CurseMaker',
  'PhantomThief',
  'Fox',
  'Turncoat',
  'Vulture',
  'SantaClaus',
  'Missioneer',
  'Strawdoll',
  'Fool',
  'TaskPlayerB',
] as const;

// Hide and Seek mode roles (2種類)
export const HIDE_AND_SEEK_ROLES = [
  'HASFox',
  'HASTroll',
] as const;

// Other roles (その他)
export const OTHER_ROLES = [
  'GM',
  'Driver',
  'Braid',
  'Vega',
  'Altair',
] as const;

// Faction colors (陣営カラー)
export const FACTION_COLORS: Record<Faction, string> = {
  Crewmate: '#00e272',
  Impostor: '#fe6a35',
  Madmate: '#9d4edd',
  Neutral: '#ffd60a',
  Other: '#6c757d',
};

/**
 * Get the faction of a role based on its main_role
 * Returns the faction: Crewmate, Impostor, Madmate, Neutral, or Other
 */
export function getRoleFaction(mainRole: string): Faction {
  if (CREWMATE_ROLES.includes(mainRole as any)) {
    return 'Crewmate';
  }
  if (IMPOSTOR_ROLES.includes(mainRole as any)) {
    return 'Impostor';
  }
  if (MADMATE_ROLES.includes(mainRole as any)) {
    return 'Madmate';
  }
  if (NEUTRAL_ROLES.includes(mainRole as any)) {
    return 'Neutral';
  }
  // Hide and Seek roles and other roles are classified as 'Other'
  return 'Other';
}

/**
 * Get color for a specific faction
 */
export function getFactionColor(faction: Faction): string {
  return FACTION_COLORS[faction];
}

/**
 * Get all factions in display order
 */
export function getAllFactions(): Faction[] {
  return ['Crewmate', 'Impostor', 'Madmate', 'Neutral', 'Other'];
}
