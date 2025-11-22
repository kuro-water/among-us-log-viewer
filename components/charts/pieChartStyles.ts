// Shared plotOptions for pie-style charts. Centralizes visual decisions so
// multiple pie-based components can keep the same look & feel.
export const COMMON_PIE_PLOT_OPTIONS = {
  pie: {
    borderWidth: 4,
    borderColor: "#ffffff",
    allowPointSelect: true,
    cursor: "pointer",
    dataLabels: [
      {
        enabled: true,
        distance: 20,
        format: "{point.name}",
        style: {
          fontSize: "0.75em",
          fontWeight: "500",
          textOutline: "none",
        },
      },
      {
        enabled: true,
        distance: -30,
        format: "{point.percentage:.1f}%",
        style: {
          fontSize: "1em",
          fontWeight: "bold",
          textOutline: "none",
          opacity: 0.9,
          color: "#ffffff",
        },
        filter: { operator: ">", property: "percentage", value: 8 },
      },
    ],
  },
} as const;

export default COMMON_PIE_PLOT_OPTIONS;
