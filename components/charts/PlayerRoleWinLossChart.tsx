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
      type: "bubble",
      height: Math.max(500, chartData.yCategories.length * 50 + 100), // 役職数に応じて高さを自動調整
      zoomType: "xy",
    },
    title: {
      text: "プレイヤー × 役職：勝率とプレイ頻度",
    },
    subtitle: {
      text: "円の大きさ：プレイ回数 / 円の色：勝率（赤=低, 緑=高）",
    },
    xAxis: {
      categories: chartData.categories,
      title: { text: null },
      gridLineWidth: 1,
      lineWidth: 0,
    },
    yAxis: {
      categories: chartData.yCategories,
      title: { text: null },
      reversed: true, // 上から順に表示
      gridLineWidth: 1,
      lineWidth: 0,
    },
    colorAxis: {
      min: 0,
      max: 100,
      stops: [
        [0, "#ef4444"], // Red
        [0.5, "#eab308"], // Yellow
        [1, "#22c55e"], // Green
      ],
      labels: {
        format: "{value}%",
      },
    },
    tooltip: {
      useHTML: true,
      headerFormat: "<table>",
      pointFormat:
        '<tr><th colspan="2"><h3>{point.playerName} - {point.roleName}</h3></th></tr>' +
        "<tr><th>勝率:</th><td><b>{point.winRate}%</b> ({point.wins}勝 {point.losses}敗)</td></tr>" +
        "<tr><th>プレイ回数:</th><td><b>{point.z}回</b></td></tr>",
      footerFormat: "</table>",
      followPointer: true,
    },
    plotOptions: {
      bubble: {
        minSize: "10%",
        maxSize: "80%", // セルからはみ出さないように調整
        zMin: 0,
        zMax: null, // 自動計算
      },
      series: {
        dataLabels: {
          enabled: true,
          format: "{point.z}",
          style: {
            textOutline: "none",
            fontWeight: "normal",
            color: "black",
            textShadow: "0px 0px 3px white",
          },
          filter: {
            property: "z",
            operator: ">",
            value: 0,
          },
        },
      },
    },
    legend: {
      enabled: true,
      align: "right",
      verticalAlign: "middle",
      layout: "vertical",
      title: {
        text: "勝率",
      },
    },
    series: chartData.series.map((s) => ({
      ...s,
      colorKey: "winRate", // 色分けに使用するプロパティ
    })),
    credits: { enabled: false },
  };

  return <BaseChart options={chartOptions} />;
}
