// Default color values
const NULL_BG_COLOR = "#f8fafc"; // when value is null, use a very light slate
const NULL_TEXT_COLOR = "#94a3b8"; // tailwind slate-400

// Thresholds for discrete color buckets
const THRESHOLDS = {
  LOW: 0.4,
  HIGH: 0.6,
};

// Colors for each bucket
const BUCKET_COLORS = {
  LOW: "#ea5550", // red
  MID: "#fdd35c", // naplesYellow
  HIGH: "#00ac97", // seaGreen
};

// Options for selecting a colorization algorithm
export type HeatmapColorMode = "gradient" | "buckets";

// Single base color for monochrome heatmaps (used when project opts for a
// single-color palette). This will produce lighter/darker rgba variants.
export const SINGLE_HEATMAP_COLOR = "#0ea5a7"; // tailwind teal-500

export interface HeatmapColorOptions {
  playCount?: number;
  maxPlayCount?: number;
  mode?: HeatmapColorMode;
  saturation?: number;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function hslGradientColor(
  value: number,
  playCount?: number,
  maxPlayCount?: number,
  saturation = 78
): string {
  const normalized = value / 100;
  const hue = normalized * 120; // 0 (red) -> 120 (green)
  const normalizedPlay =
    maxPlayCount && playCount ? clamp01(playCount / maxPlayCount) : 0;
  const lightness = 92 - normalizedPlay * 56; // 92% -> 36%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function colorFromBuckets(value: number): string {
  const normalized = value / 100;
  if (normalized < THRESHOLDS.LOW) return BUCKET_COLORS.LOW;
  if (normalized < THRESHOLDS.HIGH) return BUCKET_COLORS.MID;
  return BUCKET_COLORS.HIGH;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Compute luminance using sRGB relative luminance formula
function getLuminanceFromRgb(rgb: { r: number; g: number; b: number }) {
  const srgb = [rgb.r, rgb.g, rgb.b].map((c) => c / 255);
  const linear = srgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

/**
 * Determines the background color for a heatmap cell.
 * Supports two modes:
 * - gradient: continuous HSL gradient from red -> green, darker for larger play counts
 * - buckets: discrete color buckets (red / yellow / green)
 */
export function getHeatmapCellColor(
  value: number | null,
  options?: HeatmapColorOptions
): string {
  const mode = options?.mode ?? "gradient";
  if (value === null) return NULL_BG_COLOR;
  if (mode === "buckets") return colorFromBuckets(value);
  return hslGradientColor(
    value,
    options?.playCount,
    options?.maxPlayCount,
    options?.saturation ?? 78
  );
}

/**
 * Determines the text color for a heatmap cell based on the background color's luminance.
 * For gradient mode, using the lightness is simpler and more robust; for hex buckets we compute luminance.
 */
export function getHeatmapTextColor(
  value: number | null,
  options?: HeatmapColorOptions
): string {
  if (value === null) return NULL_TEXT_COLOR;
  const mode = options?.mode ?? "gradient";
  if (mode === "gradient") {
    // Recompute lightness using the same algorithm
    const maxPlayCount = options?.maxPlayCount ?? 0;
    const playCount = options?.playCount ?? 0;
    const normalizedPlay =
      maxPlayCount > 0 ? clamp01(playCount / maxPlayCount) : 0;
    const lightness = 92 - normalizedPlay * 56;
    return lightness < 55 ? "#ffffff" : "#1e293b"; // white vs slate-800
  }

  // buckets -> compute luminance
  const bgColor = getHeatmapCellColor(value, { mode: "buckets" });
  const rgb = hexToRgb(bgColor);
  if (!rgb) return "#ffffff";
  const luminance = getLuminanceFromRgb(rgb);
  // pick white if dark background
  return luminance > 0.5 ? "#1e293b" : "#ffffff";
}

export function getTextColorForBackground(bgColor: string): string {
  const rgb = hexToRgb(bgColor);
  if (!rgb) {
    // Try parsing rgba
    const rgba = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/.exec(
      bgColor
    );
    if (rgba) {
      const r = parseInt(rgba[1], 10);
      const g = parseInt(rgba[2], 10);
      const b = parseInt(rgba[3], 10);
      // If alpha is low, the effective color is close to white (assuming white bg)
      // But here we assume the color is what we see.
      // Actually if alpha is low, it's light.
      // Let's just check luminance of the RGB part.
      // If alpha is low, we should probably use dark text.
      // But wait, hexToRgba returns rgba.
      // If I use rgba(0,0,255, 0.1), it's very light blue. Text should be black.
      // If I use rgba(0,0,255, 1.0), it's deep blue. Text should be white.
      // So I should blend with white background to get effective luminance.
      // effective = c * alpha + white * (1 - alpha)
      // But for now let's just use a simple heuristic or just use the RGB luminance if alpha > 0.5?
      // Let's implement blending.
      const alphaVal = parseFloat(rgba[4] ?? "1");
      const blendedR = r * alphaVal + 255 * (1 - alphaVal);
      const blendedG = g * alphaVal + 255 * (1 - alphaVal);
      const blendedB = b * alphaVal + 255 * (1 - alphaVal);
      const blendedLum = getLuminanceFromRgb({
        r: blendedR,
        g: blendedG,
        b: blendedB,
      });
      return blendedLum > 0.5 ? "#1e293b" : "#ffffff";
    }
    return "#1e293b";
  }
  const luminance = getLuminanceFromRgb(rgb);
  return luminance > 0.5 ? "#1e293b" : "#ffffff";
}

export { BUCKET_COLORS };
