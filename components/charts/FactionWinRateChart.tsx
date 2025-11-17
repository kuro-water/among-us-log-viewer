'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { Chart as HighchartsReact } from '@highcharts/react';
import type { FactionWinRate } from '@/types/game-data.types';
import { getFactionColor } from '@/lib/role-mapping';

interface Props {
  data: FactionWinRate[];
}

export default function FactionWinRateChart({ data }: Props) {
  const options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Faction Win Rate',
      style: {
        color: '#ffffff',
        fontSize: '18px',
      },
    },
    tooltip: {
      pointFormat: '<b>{point.percentage:.1f}%</b><br/>Wins: {point.wins}<br/>Total: {point.total}',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
          style: {
            color: '#ffffff',
          },
        },
        showInLegend: true,
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Win Rate',
        colorByPoint: true,
        data: data.map((item) => ({
          name: item.faction,
          y: item.wins,
          wins: item.wins,
          total: item.total,
          color: getFactionColor(item.faction),
        })),
      },
    ],
    legend: {
      itemStyle: {
        color: '#ffffff',
      },
    },
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts as any} options={options as any} />;
}
