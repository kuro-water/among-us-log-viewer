'use client';

import { useMemo } from 'react';
import type { Options } from 'highcharts';
import type { PlayerWinRateData } from '../../lib/data-transformers/types';
import { BaseChart } from './BaseChart';
import { ChartEmptyState } from './ChartEmptyState';

interface PlayerWinRateChartProps {
  data: PlayerWinRateData;
  className?: string;
}

export function PlayerWinRateChart({ data, className }: PlayerWinRateChartProps) {
  const { categories, wins, losses } = useMemo(() => {
    return {
      categories: data.rows.map((row) => row.name),
      wins: data.rows.map((row) => row.wins),
      losses: data.rows.map((row) => row.losses),
    };
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: 'column' },
      title: { text: undefined },
      xAxis: {
        categories,
        crosshair: true,
        labels: { style: { color: '#475569', fontWeight: '500' } },
      },
      yAxis: {
        min: 0,
        max: 100,
        title: { text: '勝率 (%)' },
        labels: { format: '{value}%' },
      },
      plotOptions: {
        column: {
          stacking: 'percent',
          borderRadius: 4,
          pointPadding: 0.1,
        },
      },
      legend: { align: 'right', verticalAlign: 'top' },
      tooltip: {
        shared: true,
        pointFormat:
          '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
      },
      series: [
        { name: '勝利', data: wins, type: 'column', color: '#16a34a' },
        { name: '敗北', data: losses, type: 'column', color: '#ef4444' },
      ],
    }),
    [categories, losses, wins]
  );

  if (categories.length === 0) {
    return <ChartEmptyState className={className} message="プレイヤーの試合データがありません" />;
  }

  return <BaseChart options={options} className={className} />;
}
