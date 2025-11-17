'use client';

import { useMemo } from 'react';
import type { Options } from 'highcharts';
import type { PlayerRadarData } from '../../lib/data-transformers/types';
import { BaseChart } from './BaseChart';
import { ChartEmptyState } from './ChartEmptyState';

interface PlayerRadarChartProps {
  data: PlayerRadarData | null;
  className?: string;
}

export function PlayerRadarChart({ data, className }: PlayerRadarChartProps) {
  const { categories, normalizedData } = useMemo(() => {
    if (!data) {
      return { categories: [] as string[], normalizedData: [] as Array<{ y: number; custom: { actual: number; max: number } }> };
    }
    const points = data.metrics.map((metric) => ({
      y: metric.max > 0 ? Number((metric.value / metric.max).toFixed(2)) : 0,
      custom: {
        actual: Number(metric.value.toFixed(2)),
        max: Number(metric.max.toFixed(2)),
      },
    }));
    return {
      categories: data.metrics.map((metric) => metric.label),
      normalizedData: points,
    };
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      chart: { polar: true, type: 'line' },
      title: { text: undefined },
      xAxis: {
        categories,
        tickmarkPlacement: 'on',
        lineWidth: 0,
      },
      yAxis: {
        min: 0,
        max: 1,
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        tickAmount: 5,
        labels: { format: '{value}' },
      },
      legend: { enabled: false },
      tooltip: {
        headerFormat: '<span style="font-weight:600">{point.key}</span><br/>',
        pointFormat: '実績: <b>{point.custom.actual}</b><br/>最大値: {point.custom.max}',
      },
      series: [
        {
          type: 'area',
          name: data?.playerName ?? '',
          data: normalizedData,
          color: '#2563eb',
          fillOpacity: 0.3,
        },
      ],
    }),
    [categories, data, normalizedData]
  );

  if (!data || categories.length === 0) {
    return <ChartEmptyState className={className} message="プレイヤーの詳細統計がありません" />;
  }

  return <BaseChart options={options} className={className} />;
}
