import {
  Radiation,
  Droplets,
  Zap,
  Radio,
  Plane,
  Shuffle,
  Lock,
  Skull,
  CheckCircle,
  MessageCircle,
  Bell,
  LucideIcon,
} from 'lucide-react';

/**
 * Map event types to Lucide React icons
 */
export const EVENT_ICON_MAP: Record<string, LucideIcon> = {
  // Sabotage types
  'Reactor Meltdown': Radiation,
  'Reactor Meltdown (Laboratory)': Radiation,
  'O2 Depletion': Droplets,
  'Lights Sabotage': Zap,
  'Communications Sabotage': Radio,
  'Crash Course': Plane,
  'Mushroom Mixup': Shuffle,
  'Door Close': Lock,
  
  // Combat
  'Kill': Skull,
  
  // Tasks
  'TaskCompleted': CheckCircle,
  
  // Meetings
  'Meeting': MessageCircle,
  'EmergencyButton': Bell,
};

/**
 * Get icon component for an event type
 */
export function getEventIcon(eventType: string, sabotageType?: string): LucideIcon {
  // For sabotage events, use the sabotage type
  if (eventType === 'Sabotage' && sabotageType) {
    return EVENT_ICON_MAP[sabotageType] || Radio;
  }
  
  // For other events, use the event type
  return EVENT_ICON_MAP[eventType] || MessageCircle;
}

/**
 * Get icon name for serialization/display
 */
export function getEventIconName(eventType: string, sabotageType?: string): string {
  const icon = getEventIcon(eventType, sabotageType);
  return icon.name || 'MessageCircle';
}
