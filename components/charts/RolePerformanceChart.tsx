'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { Chart as HighchartsReact } from '@highcharts/react';
import type { RolePerformance } from '@/types/game-data.types';
import { getFactionColor } from '@/lib/role-mapping';

interface Props {
  data: RolePerformance[];
  maxRoles?: number;
}

export default function RolePerformanceChart({ data, maxRoles = 10 }: Props) {
  const topRoles = data.slice(0, maxRoles);

  const options = {
    chart: {
      type: 'bar',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Role Performance',
      style: {
        color: '#ffffff',
        fontSize: '18px',
      },
    },
    xAxis: {
      categories: topRoles.map((r) => r.role),
      title: {
        text: null,
      },
      labels: {
        style: { color: '#ffffff' },
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
      pointFormat: '<b>{point.y:.1f}%</b><br/>Games: {point.games}<br/>Avg Tasks: {point.avgTasks:.1f}<br/>Avg Survival: {point.avgSurvival:.0f}s',
    },
    plotOptions: {
      bar: {
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
        type: 'bar',
        name: 'Win Rate',
        colorByPoint: true,
        data: topRoles.map((role) => ({
          y: role.winRate,
          games: role.totalGames,
          avgTasks: role.averageTasks,
          avgSurvival: role.averageSurvivalTime,
          color: getFactionColor(role.faction),
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
