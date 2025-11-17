'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { HeatmapData } from '@/types/game-data.types';
import { useEffect, useState } from 'react';

interface Props {
  data: HeatmapData;
}

export default function PlayerFactionHeatmap({ data }: Props) {
  const [heatmapLoaded, setHeatmapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import heatmap module
    import('highcharts/modules/heatmap').then((module: any) => {
      module.default(Highcharts);
      setHeatmapLoaded(true);
    });
  }, []);

  if (!heatmapLoaded) {
    return <div>Loading...</div>;
  }

  const options: Highcharts.Options = {
    chart: {
      type: 'heatmap',
      marginTop: 40,
      marginBottom: 80,
      plotBorderWidth: 1,
    },
    title: {
      text: 'Player × Faction Win Rate Heatmap',
    },
    xAxis: {
      categories: data.xAxis,
      title: {
        text: 'Players',
      },
    },
    yAxis: {
      categories: data.yAxis,
      title: {
        text: 'Factions',
      },
    },
    colorAxis: {
      min: 0,
      max: 100,
      stops: [
        [0, '#ff0000'],    // 0% - Red
        [0.5, '#ffff00'],  // 50% - Yellow
        [1, '#00ff00'],    // 100% - Green
      ],
      labels: {
        format: '{value}%',
      },
    },
    legend: {
      align: 'right',
      layout: 'vertical',
      margin: 0,
      verticalAlign: 'top',
      y: 25,
      symbolHeight: 280,
    },
    tooltip: {
      formatter: function (this: any) {
        const point = this.point as any;
        if (point.playCount === 0) {
          return `<b>${data.xAxis[point.x]}</b><br/>${data.yAxis[point.y]}<br/>No data`;
        }
        return `<b>${data.xAxis[point.x]}</b><br/>${data.yAxis[point.y]}<br/>Win Rate: ${point.value}%<br/>Games: ${point.playCount}`;
      },
    },
    series: [
      {
        name: 'Win Rate',
        type: 'heatmap',
        borderWidth: 1,
        data: data.data.map(cell => ({
          x: cell.x,
          y: cell.y,
          value: cell.value,
          playCount: cell.playCount,
          color: cell.playCount === 0 ? '#cccccc' : undefined,
        })),
        dataLabels: {
          enabled: true,
          useHTML: true,
          formatter: function (this: any) {
            const point = this.point as any;
            if (point.playCount === 0) {
              return '<div style="text-align: center;">-</div>';
            }
            return `<div style="text-align: center;">${point.value}%<br/>${point.playCount}回</div>`;
          },
        },
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
