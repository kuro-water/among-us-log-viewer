import dynamic from "next/dynamic";
import { useMemo } from "react";
import { buildPlayerRoleWinLossChartData } from "../../lib/data-transformers/player-role-winloss";
import type { TransformerOptions } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";

interface PlayerRoleWinLossChartProps {
  options: TransformerOptions;
}

const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

export default function PlayerRoleWinLossChart({
  options,
}: PlayerRoleWinLossChartProps) {
  const chartData = useMemo(
    () => buildPlayerRoleWinLossChartData(options),
    [options]
  );

  const chartOptions: any = {
    chart: {
      type: "column",
      height: 480,
    },
    title: {
      text: "プレイヤーごとの役職別勝率",
    },
    xAxis: {
      categories: chartData.categories,
      title: { text: "プレイヤー" },
    },
    yAxis: {
      min: null,
      title: { text: "勝率（%）（正：勝利 / 負：敗北）" },
      allowDecimals: true,
      plotLines: [{ value: 0, color: "#888", width: 1 }],
    },
    tooltip: {
      shared: true,
      formatter: function (this: any) {
        const points = this.points || [];
        let s: any = `<b>${this.x}</b><br/>`;
        points.forEach((p: any) => {
          s += `<span style='color:${p.color}'>●</span> ${
            p.series.name
          }: <b>${Math.abs(p.y).toFixed(1)}%</b><br/>`;
        });
        return s;
      },
    },
    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: {
          enabled: true,
          formatter: function (this: any) {
            return this.y !== 0 ? Math.abs(this.y).toFixed(1) + "%" : "";
          },
        },
      },
    },
    series: chartData.series.map((s) => ({
      name: s.name,
      data: s.data,
      color: s.color,
      stack: s.isWin ? "win" : "loss",
    })),
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
    },
    credits: { enabled: false },
  };

  return <BaseChart options={chartOptions} />;
}
