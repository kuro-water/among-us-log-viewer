'use client';

import { useMemo } from 'react';
import type { Options } from 'highcharts';
import type { TaskTimelineData } from '../../lib/data-transformers/types';
import { BaseChart } from './BaseChart';
import { ChartEmptyState } from './ChartEmptyState';
import { formatDuration } from '../../lib/formatters';

interface TaskTimelineChartProps {
  data: TaskTimelineData | null;
  className?: string;
}

export function TaskTimelineChart({ data, className }: TaskTimelineChartProps) {
  const seriesData = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.points.map((point) => ({
      x: Number((point.elapsedSeconds / 60).toFixed(2)),
      y: point.totalTasksCompleted,
      custom: {
        player: point.playerName,
        timeLabel: formatDuration(point.elapsedSeconds),
      },
    }));
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: 'area' },
      title: { text: undefined },
      xAxis: {
        title: { text: '経過時間 (分)' },
        labels: { format: '{value}分' },
      },
      yAxis: {
        title: { text: '累計タスク完了数' },
        max: data?.taskTotal,
      },
      tooltip: {
        shared: false,
        pointFormat:
          '時刻: {point.custom.timeLabel}<br/>タスク完了: <b>{point.y}</b><br/>プレイヤー: {point.custom.player}',
      },
      plotOptions: {
        area: {
          step: 'left',
          fillOpacity: 0.25,
        },
      },
      series: [
        {
          name: 'タスク完了',
          type: 'area',
          data: seriesData,
          color: '#2563eb',
        },
      ],
    }),
    [data, seriesData]
  );

  if (!data || seriesData.length === 0) {
    return <ChartEmptyState className={className} message="タスクタイムラインのデータがありません" />;
  }

  return <BaseChart options={options} className={className} />;
}
