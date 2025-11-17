'use client';

import { useMemo } from 'react';
import type { Options } from 'highcharts';
import type { MovementWithEventsData } from '../../lib/data-transformers/types';
import { BaseChart } from './BaseChart';
import { ChartEmptyState } from './ChartEmptyState';
import { formatDuration } from '../../lib/formatters';

interface MovementWithEventsChartProps {
  data: MovementWithEventsData | null;
  className?: string;
}

export function MovementWithEventsChart({ data, className }: MovementWithEventsChartProps) {
  const { movementSeries, eventSeries, maxMinutes } = useMemo(() => {
    if (!data) {
      return {
        movementSeries: [],
        eventSeries: [],
        maxMinutes: 0,
      };
    }

    const series = data.series.map((entry) => ({
      type: 'spline' as const,
      name: entry.playerName,
      data: entry.data.map((point) => ({
        x: Number((point.x / 60).toFixed(2)),
        y: Number(point.y.toFixed(1)),
        custom: { timeLabel: formatDuration(point.x) },
      })),
    }));

    const events = data.events.map((event) => ({
      x: Number((event.x / 60).toFixed(2)),
      y: 1,
      color: event.color,
      custom: {
        label: event.label,
        type: event.type,
        timeLabel: formatDuration(event.x),
      },
    }));

    return {
      movementSeries: series,
      eventSeries: events,
      maxMinutes: Number((data.durationSeconds / 60).toFixed(1)),
    };
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      title: { text: undefined },
      xAxis: {
        title: { text: '経過時間 (分)' },
        labels: { format: '{value}分' },
        max: maxMinutes,
      },
      yAxis: [
        {
          title: { text: '移動距離 (m)' },
        },
        {
          title: { text: '' },
          max: 1,
          min: 0,
          visible: false,
          opposite: true,
        },
      ],
      legend: { align: 'right', verticalAlign: 'top' },
      tooltip: { shared: false },
      series: [
        ...movementSeries.map((series) => ({
          ...series,
          tooltip: {
            pointFormat: '{series.name}<br/>時刻: {point.custom.timeLabel}<br/>距離: <b>{point.y:.0f} m</b>',
          },
        })),
        {
          type: 'scatter',
          name: 'イベント',
          data: eventSeries,
          yAxis: 1,
          marker: { symbol: 'circle', radius: 6 },
          tooltip: {
            pointFormat:
              '<span style="color:{point.color}">{point.custom.label}</span><br/>時刻: {point.custom.timeLabel}',
          },
        },
      ],
    }),
    [eventSeries, maxMinutes, movementSeries]
  );

  if (!data || movementSeries.length === 0) {
    return <ChartEmptyState className={className} message="移動データがありません" />;
  }

  return <BaseChart options={options} className={className} />;
}
