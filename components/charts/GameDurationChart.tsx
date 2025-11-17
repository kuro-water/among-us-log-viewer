'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { Chart as HighchartsReact } from '@highcharts/react';
import type { GameDurationData } from '@/lib/data-transformers/game-duration';

interface Props {
  data: GameDurationData[];
}

export default function GameDurationChart({ data }: Props) {
  const options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Game Duration Distribution',
      style: {
        color: '#ffffff',
        fontSize: '18px',
      },
    },
    xAxis: {
      categories: data.map((d) => `${d.duration}-${d.duration + 5}m`),
      title: {
        text: 'Duration (minutes)',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Number of Games',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
      },
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> games',
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          style: {
            color: '#ffffff',
          },
        },
        color: '#ffd60a',
      },
    },
    series: [
      {
        type: 'column',
        name: 'Games',
        data: data.map((d) => d.count),
      },
    ],
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts as any} options={options as any} />;
}
