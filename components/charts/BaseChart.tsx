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
let pieAnimatePatched = false;

function initHighcharts() {
  if (!modulesInitialized) {
    // Different bundlers / module formats may expose the module initializer in
    // different shapes (callable function, { default: fn }, or already-applied
    // object). Try several strategies so this works robustly in Turbopack/
    // Next.js environments.
    const tryInvoke = (mod: any) => {
      if (!mod) return;
      try {
        if (typeof mod === "function") {
          mod(Highcharts);
          return;
        }
        if (mod && typeof mod.default === "function") {
          mod.default(Highcharts);
          return;
        }
        // Some builds export an object where one of the properties is the
        // initializer function (rare). Try to find and call it.
        if (mod && typeof mod === "object") {
          for (const key of Object.keys(mod)) {
            const v = (mod as any)[key];
            if (typeof v === "function") {
              try {
                v(Highcharts);
                return;
              } catch (e) {
                // ignore and continue
              }
            }
          }
        }
        // If nothing worked, it's possible the module already applied itself
        // to the global Highcharts; in that case we don't need to do anything.
      } catch (err) {
        // Don't fail the whole app if a single module initializer throws.
        // Log to console for debugging.
        // eslint-disable-next-line no-console
        console.warn("Highcharts module initialization failed:", err);
      }
    };

    tryInvoke(heatmapModule as any);
    tryInvoke(histogramModule as any);
    tryInvoke(exportingModule as any);
    tryInvoke(accessibilityModule as any);
    tryInvoke(annotationsModule as any);

    modulesInitialized = true;
  }

  if (!themeInitialized) {
    applyHighchartsTheme();
    themeInitialized = true;
  }

  // Patch pie animation once to support a fan-like sequential reveal that is
  // optionally enabled per-series via `series.options.fanAnimate`.
  // We patch here (rather than in PlayerRolePlayRateChart) so that the
  // override is installed before the HighchartsReact instance initializes
  // its charts. The patched implementation delegates to the original
  // animate function for pies that don't opt-in via `fanAnimate`.
  if (
    !pieAnimatePatched &&
    Highcharts &&
    (Highcharts as any).seriesTypes?.pie
  ) {
    try {
      const pieProto: any = (Highcharts as any).seriesTypes.pie.prototype;
      const originalAnimate = pieProto.animate;

      pieProto.animate = function (this: any, init: any) {
        // If this series doesn't opt-in, call the original implementation.
        if (!this.options || !this.options.fanAnimate) {
          return originalAnimate.call(this, init);
        }

        const series = this as any;
        const chart = series.chart;
        const points = series.points || [];
        const animation = (series.options && series.options.animation) || {};
        const startAngleRad = series.startAngleRad;

        function fanAnimate(point: any, startAngle: any) {
          const graphic = point.graphic;
          const args = point.shapeArgs;

          if (graphic && args) {
            graphic
              .attr({ start: startAngle, end: startAngle, opacity: 1 })
              .animate(
                { start: args.start, end: args.end },
                {
                  duration:
                    (animation && animation.duration
                      ? animation.duration
                      : 1000) / Math.max(points.length, 1),
                },
                function () {
                  if (points[point.index + 1]) {
                    fanAnimate(points[point.index + 1], args.end);
                  }

                  if (point.index === points.length - 1) {
                    // At the very end, fade in data labels and apply an inner
                    // size/borderRadius to create the donut-like final look.
                    if (series.dataLabelsGroup) {
                      series.dataLabelsGroup.animate(
                        { opacity: 1 },
                        void 0,
                        function () {
                          points.forEach((p: any) => {
                            p.opacity = 1;
                          });
                          series.update({ enableMouseTracking: true }, false);
                          // Respect per-series fanInnerSize if provided, else fall back
                          // to a default of '40%'. We use chart.update only for
                          // pie-wide properties like borderRadius; innerSize is set
                          // on the series so it only affects this chart's series.
                          const fanInner =
                            (series.options && series.options.fanInnerSize) ||
                            "40%";
                          try {
                            series.update({ innerSize: fanInner }, false);
                          } catch (err) {
                            // ignore if series.update not supported for innerSize
                          }
                          chart.update({
                            plotOptions: { pie: { borderRadius: 8 } },
                          });
                        }
                      );
                    } else {
                      series.update({ enableMouseTracking: true }, false);
                      const fanInner =
                        (series.options && series.options.fanInnerSize) ||
                        "40%";
                      try {
                        series.update({ innerSize: fanInner }, false);
                      } catch (err) {
                        /* ignore */
                      }
                      chart.update({
                        plotOptions: { pie: { borderRadius: 8 } },
                      });
                    }
                  }
                }
              );
          }
        }

        if (init) {
          points.forEach((p: any) => {
            p.opacity = 0;
          });
        } else {
          fanAnimate(points[0], startAngleRad);
        }
      };

      pieAnimatePatched = true;
    } catch (err) {
      // Non-critical: if we fail to patch, keep the original animate.
      // eslint-disable-next-line no-console
      console.warn("Failed to patch pie animate", err);
    }
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
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        immutable
      />
    </div>
  );
}
