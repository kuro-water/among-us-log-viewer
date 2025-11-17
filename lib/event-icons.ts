import {
  Radiation,
  Droplets,
  Zap,
  Radio,
  Plane,
  CircleDot,
  Lock,
  Swords,
  CheckCircle,
  MessageCircle,
  Bell,
  type LucideIcon,
} from 'lucide-react';

// Map event types to Lucide React icons
export const EVENT_ICONS: Record<string, LucideIcon> = {
  // Sabotages
  ReactorMeltdown: Radiation,
  O2Depletion: Droplets,
  LightsSabotage: Zap,
  CommunicationsSabotage: Radio,
  CrashCourse: Plane,
  MushroomMixup: CircleDot,
  DoorClose: Lock,
  
  // Actions
  Kill: Swords,
  TaskCompleted: CheckCircle,
  Meeting: MessageCircle,
  EmergencyButton: Bell,
  
  // Additional common event types
  BodyReported: MessageCircle,
  SabotageFixed: CheckCircle,
  VentUsed: Lock,
};

/**
 * Get the icon component for a specific event type
 */
export function getEventIcon(eventType: string): LucideIcon | null {
  return EVENT_ICONS[eventType] || null;
}

/**
 * Get all event types that have icons
 */
export function getEventTypesWithIcons(): string[] {
  return Object.keys(EVENT_ICONS);
}
