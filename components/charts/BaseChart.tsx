"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import heatmapModule from "highcharts/modules/heatmap";
import histogramModule from "highcharts/modules/histogram-bellcurve";
import exportingModule from "highcharts/modules/exporting";
import accessibilityModule from "highcharts/modules/accessibility";
import annotationsModule from "highcharts/modules/annotations";
import { applyHighchartsTheme } from "@/config/highcharts-theme";
import type { Options } from "highcharts";
import { useMemo } from "react";

let modulesInitialized = false;
let themeInitialized = false;

function initHighcharts() {
  if (!modulesInitialized) {
    heatmapModule(Highcharts);
    histogramModule(Highcharts);
    exportingModule(Highcharts);
    accessibilityModule(Highcharts);
    annotationsModule(Highcharts);
    modulesInitialized = true;
  }

  if (!themeInitialized) {
    applyHighchartsTheme();
    themeInitialized = true;
  }
}

export interface BaseChartProps {
  options: Options;
  className?: string;
}

export function BaseChart({ options, className }: BaseChartProps) {
  const chartOptions = useMemo(() => options, [options]);
  initHighcharts();

  return (
    <div className={className}>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} immutable />
    </div>
  );
}
