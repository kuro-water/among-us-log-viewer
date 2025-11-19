import Highcharts from "highcharts";
import { FACTION_COLORS } from "./factions";

// Primary palette: crewmate (cyan), impostor (red), neutral (green)
// followed by a few accent colors for other series
const CORE_COLORS = [
  FACTION_COLORS.Crewmate, // Crewmate (cyan)
  FACTION_COLORS.Impostor, // Impostor (red)
  FACTION_COLORS.Neutral, // Neutral / third faction (green)
  "#f97316", // orange accent
  "#6d28d9", // purple accent
  "#14b8a6", // teal accent
  "#facc15", // yellow accent
  "#94a3b8", // soft purple
  "#2563eb", // blue
];

const TEXT_PRIMARY = "#0f172a";
const TEXT_MUTED = "#64748b";
const GRID_COLOR = "#e2e8f0";

let applied = false;

export function applyHighchartsTheme() {
  if (applied) {
    return;
  }

  Highcharts.setOptions({
    // Disable the default Highcharts context menu for export/print so
    // dashboard charts don't show an 'options' button.
    exporting: {
      enabled: false,
      buttons: { contextButton: { enabled: false } },
    },
    colors: CORE_COLORS,
    chart: {
      backgroundColor: "transparent",
      style: {
        fontFamily: "var(--font-geist-sans, 'Inter', system-ui)",
        color: TEXT_PRIMARY,
      },
      spacing: [18, 18, 18, 18],
      plotBorderColor: GRID_COLOR,
    },
    title: {
      style: {
        color: TEXT_PRIMARY,
        fontWeight: "600",
        fontSize: "18px",
      },
    },
    subtitle: {
      style: {
        color: TEXT_MUTED,
      },
    },
    legend: {
      itemStyle: { color: TEXT_PRIMARY, fontWeight: "500" },
      itemHoverStyle: { color: "#1d4ed8" },
      backgroundColor: "transparent",
      borderWidth: 0,
      symbolRadius: 6,
    },
    tooltip: {
      backgroundColor: "#0f172a",
      borderColor: "transparent",
      style: {
        color: "#ffffff",
        fontSize: "13px",
      },
      borderWidth: 0,
      borderRadius: 12,
      shadow: false,
    },
    xAxis: {
      gridLineColor: "#f1f5f9",
      lineColor: GRID_COLOR,
      tickColor: GRID_COLOR,
      labels: {
        style: {
          color: TEXT_MUTED,
          fontSize: "12px",
        },
      },
      title: {
        style: {
          color: TEXT_MUTED,
          fontSize: "13px",
        },
      },
    },
    yAxis: {
      gridLineColor: "#f1f5f9",
      labels: {
        style: {
          color: TEXT_MUTED,
          fontSize: "12px",
        },
      },
      title: {
        style: {
          color: TEXT_MUTED,
          fontSize: "13px",
        },
      },
    },
    plotOptions: {
      series: {
        dataLabels: {
          color: TEXT_PRIMARY,
          style: { textOutline: "none", fontWeight: "600" },
        },
        borderWidth: 0,
        marker: {
          lineColor: "transparent",
        },
      },
      heatmap: {
        borderWidth: 1,
        borderColor: "#f8fafc",
        dataLabels: {
          enabled: true,
          color: TEXT_PRIMARY,
          style: { textOutline: "none", fontWeight: "600" },
        },
      },
    },
    lang: {
      thousandsSep: ",",
    },
  });

  applied = true;
}
