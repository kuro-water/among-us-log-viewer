'use client';

import { useMemo } from 'react';
import type { Options } from 'highcharts';
import type { FactionWinRateData } from '../../lib/data-transformers/types';
import { BaseChart } from './BaseChart';
import { ChartEmptyState } from './ChartEmptyState';

interface FactionWinRateChartProps {
  data: FactionWinRateData;
  className?: string;
}

export function FactionWinRateChart({ data, className }: FactionWinRateChartProps) {
  const pieData = useMemo(
    () =>
      data.breakdown.map((item) => ({
        name: item.faction,
        y: item.wins,
        color: item.color,
        custom: {
          games: item.games,
          wins: item.wins,
          losses: item.losses,
          winRate: item.winRate * 100,
        },
      })),
    [data]
  );

  const totalGames = data.totalGames;

  const options = useMemo<Options>(
    () => ({
      chart: { type: 'pie' },
      title: { text: undefined },
      tooltip: {
        pointFormat:
          '<span style="font-weight:600;color:#0f172a">{point.name}</span><br/>' +
          '勝率: {point.custom.winRate:.1f}%<br/>' +
          '勝利: {point.custom.wins} / 試合数: {point.custom.games}',
      },
      plotOptions: {
        pie: {
          innerSize: '60%',
          dataLabels: {
            enabled: true,
            useHTML: true,
            format:
              '<span style="font-weight:600;color:#0f172a">{point.name}</span><br/>' +
              '<span style="color:#475569">{point.custom.winRate:.1f}%</span>',
          },
        },
      },
      series: [
        {
          type: 'pie',
          name: '勝利数',
          data: pieData,
        },
      ],
      subtitle: {
        text: totalGames > 0 ? `総試合数 ${totalGames}` : undefined,
        style: { color: '#64748b', fontSize: '13px' },
      },
    }),
    [pieData, totalGames]
  );

  if (pieData.length === 0) {
    return <ChartEmptyState className={className} message="勝利データがありません" />;
  }

  return <BaseChart options={options} className={className} />;
}
