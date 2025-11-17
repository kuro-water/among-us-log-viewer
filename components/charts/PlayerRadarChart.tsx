'use client';

import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import { Chart as HighchartsReact } from '@highcharts/react';
import type { PlayerRadarData } from '@/lib/data-transformers/player-radar';

// Initialize highcharts-more for polar charts
if (typeof window !== 'undefined') {
  const HighchartsMore = require('highcharts/highcharts-more');
  HighchartsMore(Highcharts);
}

interface Props {
  data: PlayerRadarData[];
  playerIndex?: number;
}

export default function PlayerRadarChart({ data, playerIndex = 0 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || data.length === 0) {
    return <div className="h-96 bg-gray-800 rounded animate-pulse" />;
  }

  const player = data[playerIndex] || data[0];

  const options = {
    chart: {
      polar: true,
      backgroundColor: 'transparent',
    },
    title: {
      text: `Player Radar: ${player.playerName}`,
      style: {
        color: '#ffffff',
        fontSize: '18px',
      },
    },
    pane: {
      size: '80%',
    },
    xAxis: {
      categories: ['Kills', 'Tasks', 'Distance', 'Survival Rate'],
      tickmarkPlacement: 'on',
      lineWidth: 0,
      labels: {
        style: { color: '#ffffff' },
      },
    },
    yAxis: {
      gridLineInterpolation: 'polygon',
      lineWidth: 0,
      min: 0,
      labels: {
        style: { color: '#ffffff' },
      },
    },
    tooltip: {
      shared: true,
      pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:.1f}</b><br/>',
    },
    series: [
      {
        type: 'area',
        name: player.playerName,
        data: [
          player.kills,
          player.tasks,
          Math.round(player.distance / 10), // Scale down distance
          player.survivalRate,
        ],
        pointPlacement: 'on',
        color: '#00e272',
        fillOpacity: 0.3,
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
