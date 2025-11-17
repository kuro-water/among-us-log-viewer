'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { Chart as HighchartsReact } from '@highcharts/react';
import type { MovementTimelinePoint } from '@/lib/data-transformers/movement-with-events';

interface Props {
  data: MovementTimelinePoint[];
  playerName: string;
}

export default function MovementWithEventsChart({ data, playerName }: Props) {
  const options = {
    chart: {
      type: 'spline',
      backgroundColor: 'transparent',
    },
    title: {
      text: `Movement Timeline: ${playerName}`,
      style: {
        color: '#ffffff',
        fontSize: '18px',
      },
    },
    xAxis: {
      title: {
        text: 'Time (seconds)',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
      },
    },
    yAxis: {
      title: {
        text: 'Cumulative Distance',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
      },
    },
    tooltip: {
      formatter: function (this: any) {
        const point = this.point;
        let tooltip = `<b>Time: ${point.x.toFixed(0)}s</b><br/>Distance: ${point.y.toFixed(1)}`;
        if (point.event) {
          tooltip += `<br/><b>Event:</b> ${point.event.event_type}`;
        }
        return tooltip;
      },
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: true,
          radius: 3,
        },
      },
    },
    series: [
      {
        type: 'spline',
        name: 'Distance',
        color: '#ffd60a',
        data: data.map((point) => ({
          x: point.time,
          y: point.distance,
          event: point.event,
          marker: point.event ? {
            enabled: true,
            symbol: 'circle',
            radius: 6,
            fillColor: '#fe6a35',
          } : undefined,
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
