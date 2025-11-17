'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { Chart as HighchartsReact } from '@highcharts/react';
import type { PlayerStats } from '@/types/game-data.types';

interface Props {
  data: PlayerStats[];
}

export default function PlayerWinRateChart({ data }: Props) {
  const options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Player Win Rates',
      style: {
        color: '#ffffff',
        fontSize: '18px',
      },
    },
    xAxis: {
      categories: data.map((p) => p.playerName),
      labels: {
        style: { color: '#ffffff' },
        rotation: -45,
      },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'Win Rate (%)',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
        format: '{value}%',
      },
    },
    tooltip: {
      pointFormat: '<b>{point.y:.1f}%</b><br/>Wins: {point.wins}<br/>Losses: {point.losses}<br/>Total Games: {point.total}',
    },
    plotOptions: {
      column: {
        stacking: undefined,
        dataLabels: {
          enabled: true,
          format: '{point.y:.0f}%',
          style: {
            color: '#ffffff',
          },
        },
      },
    },
    series: [
      {
        type: 'column',
        name: 'Win Rate',
        data: data.map((player) => ({
          y: player.winRate,
          wins: player.wins,
          losses: player.losses,
          total: player.totalGames,
          color: player.winRate >= 50 ? '#00e272' : '#fe6a35',
        })),
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
