'use client';

import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import { Chart as HighchartsReact } from '@highcharts/react';
import type { HeatmapData } from '@/types/game-data.types';

// Dynamically import heatmap module
if (typeof window !== 'undefined') {
  require('highcharts/modules/heatmap')(Highcharts);
}

interface Props {
  data: HeatmapData;
  title?: string;
}

export default function PlayerFactionHeatmap({ data, title = 'Player × Faction Win Rate' }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-96 bg-gray-800 rounded animate-pulse" />;
  }

  const options = {
    chart: {
      type: 'heatmap',
      backgroundColor: 'transparent',
      height: 400,
    },
    title: {
      text: title,
      style: {
        color: '#ffffff',
        fontSize: '18px',
      },
    },
    xAxis: {
      categories: data.xAxis,
      title: {
        text: 'Players',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
        rotation: -45,
      },
    },
    yAxis: {
      categories: data.yAxis,
      title: {
        text: 'Faction',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
      },
      reversed: true,
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
        style: { color: '#ffffff' },
      },
    },
    legend: {
      align: 'right',
      layout: 'vertical',
      verticalAlign: 'middle',
      itemStyle: {
        color: '#ffffff',
      },
    },
    tooltip: {
      formatter: function (this: any) {
        const point = this.point as any;
        const playerName = data.xAxis[point.x];
        const faction = data.yAxis[point.y];
        const winRate = point.value !== null ? point.value.toFixed(1) : 'N/A';
        const playCount = point.playCount || 0;
        
        return `<b>${playerName}</b><br/>
                Faction: ${faction}<br/>
                Win Rate: ${winRate}%<br/>
                Games Played: ${playCount}`;
      },
    },
    series: [
      {
        type: 'heatmap',
        name: 'Win Rate',
        borderWidth: 1,
        borderColor: '#333333',
        data: data.data.map((cell) => ({
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
              return '<div style="text-align: center; color: #666;">-</div>';
            }
            const winRate = point.value !== null ? Math.round(point.value) : 0;
            return `<div style="text-align: center; color: #000; font-weight: bold;">
                      ${winRate}%<br/>
                      <span style="font-size: 10px;">${point.playCount} games</span>
                    </div>`;
          },
        },
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts as any} options={options as any} />;
}
