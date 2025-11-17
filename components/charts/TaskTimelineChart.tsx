'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { Chart as HighchartsReact } from '@highcharts/react';
import type { TaskTimelineData } from '@/lib/data-transformers/task-timeline';

interface Props {
  data: TaskTimelineData[];
}

export default function TaskTimelineChart({ data }: Props) {
  const options = {
    chart: {
      type: 'area',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Task Completion Timeline',
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
        text: 'Tasks Completed',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
      },
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> tasks ({point.percentage:.0f}%)<br/>Time: {point.x:.0f}s',
    },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(0, 226, 114, 0.5)'],
            [1, 'rgba(0, 226, 114, 0.1)'],
          ],
        },
        marker: {
          radius: 2,
        },
        lineWidth: 2,
        states: {
          hover: {
            lineWidth: 3,
          },
        },
      },
    },
    series: [
      {
        type: 'area',
        name: 'Tasks',
        color: '#00e272',
        data: data.map((point) => ({
          x: point.time,
          y: point.tasksCompleted,
          percentage: point.completionPercentage,
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
