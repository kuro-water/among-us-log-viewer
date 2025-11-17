'use client';

import { useMemo } from 'react';
import type { Options } from 'highcharts';
import type { GameDurationData } from '../../lib/data-transformers/types';
import { BaseChart } from './BaseChart';
import { ChartEmptyState } from './ChartEmptyState';

interface GameDurationChartProps {
  data: GameDurationData;
  className?: string;
}

export function GameDurationChart({ data, className }: GameDurationChartProps) {
  const minutes = useMemo(() => data.durations.map((value) => Number((value / 60).toFixed(2))), [data]);

  const histogramId = 'game-duration-base';

  const options = useMemo<Options>(
    () => ({
      title: { text: undefined },
      xAxis: {
        title: { text: '試合時間 (分)' },
        labels: { format: '{value}分' },
      },
      yAxis: {
        title: { text: '試合数' },
        allowDecimals: false,
      },
      legend: { enabled: false },
      tooltip: {
        headerFormat: '',
        pointFormat: '{point.x:.1f}〜{point.x2:.1f} 分: <b>{point.y} 試合</b>',
      },
      series: [
        {
          id: histogramId,
          type: 'scatter',
          data: minutes,
          visible: false,
          showInLegend: false,
        },
        {
          type: 'histogram',
          baseSeries: histogramId,
          binsNumber: 'square-root',
          name: '試合数',
          color: '#2563eb',
        },
      ],
    }),
    [minutes]
  );

  if (minutes.length === 0) {
    return <ChartEmptyState className={className} message="試合時間のデータがありません" />;
  }

  return <BaseChart options={options} className={className} />;
}
