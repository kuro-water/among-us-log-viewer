'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { Chart as HighchartsReact } from '@highcharts/react';
import type { EventDensityData } from '@/lib/data-transformers/event-density';

interface Props {
  data: EventDensityData[];
}

export default function EventDensityChart({ data }: Props) {
  const options = {
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Event Density Over Time',
      style: {
        color: '#ffffff',
        fontSize: '18px',
      },
    },
    xAxis: {
      categories: data.map((d) => d.timeRange),
      title: {
        text: 'Time Range',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
      },
    },
    yAxis: {
      title: {
        text: 'Events per Minute',
        style: { color: '#ffffff' },
      },
      labels: {
        style: { color: '#ffffff' },
      },
    },
    tooltip: {
      pointFormat: '<b>{point.y:.1f}</b> events/min<br/>Total: {point.total} events',
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
          format: '{point.y:.1f}',
          style: {
            color: '#ffffff',
          },
        },
        enableMouseTracking: true,
      },
    },
    series: [
      {
        type: 'line',
        name: 'Event Density',
        color: '#9d4edd',
        data: data.map((d) => ({
          y: d.eventsPerMinute,
          total: d.eventCount,
        })),
        marker: {
          enabled: true,
          radius: 4,
        },
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
