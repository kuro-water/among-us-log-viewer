const numberFormatter = new Intl.NumberFormat("ja-JP");

export function formatNumber(value: number, maximumFractionDigits = 0): string {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return numberFormatter.format(Number(value.toFixed(maximumFractionDigits)));
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }
  return `${value.toFixed(digits)}%`;
}

export function formatRatio(ratio: number, digits = 1): string {
  if (!Number.isFinite(ratio)) {
    return "0%";
  }
  return formatPercent(ratio * 100, digits);
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatMinutes(value: number, digits = 1): string {
  if (!Number.isFinite(value)) {
    return "0 分";
  }
  return `${value.toFixed(digits)} 分`;
}

export function metersToKilometers(distance: number, digits = 1): string {
  if (!Number.isFinite(distance)) {
    return "0 km";
  }
  return `${(distance / 1000).toFixed(digits)} km`;
}

export function safeDivide(numerator: number, denominator: number): number {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return 0;
  }
  return numerator / denominator;
}
