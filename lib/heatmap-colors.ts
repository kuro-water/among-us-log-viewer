import { PALETTE } from "../config/colors";

// Thresholds for discrete color buckets
const THRESHOLDS = {
  LOW: 0.4,
  HIGH: 0.6,
};

// Colors for each bucket
const COLORS = {
  LOW: PALETTE.red, // #ea5550
  MID: PALETTE.naplesYellow, // #fdd35c
  HIGH: PALETTE.seaGreen, // #00ac97
};

/**
 * Determines the background color for a heatmap cell based on its value.
 * Uses discrete color buckets: Red (<40%), Yellow (40-60%), Green (>60%).
 */
export function getHeatmapCellColor(value: number | null): string {
  if (value === null) return "bg-slate-100";

  const normalizedValue = value / 100;

  if (normalizedValue < THRESHOLDS.LOW) {
    return COLORS.LOW;
  } else if (normalizedValue < THRESHOLDS.HIGH) {
    return COLORS.MID;
  } else {
    return COLORS.HIGH;
  }
}

/**
 * Determines the text color for a heatmap cell based on the background color's luminance.
 * Ensures readability by choosing either dark slate or white text.
 */
export function getHeatmapTextColor(value: number | null): string {
  if (value === null) return "#94a3b8"; // tailwind slate-400

  const bgColor = getHeatmapCellColor(value);
  
  // Parse hex to RGB
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bgColor);
  const rgb = result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };

  // Calculate relative luminance
  // Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;

  // Threshold for text contrast
  return luminance > 0.5 ? "#1e293b" : "#ffffff"; // slate-800 or white
}
