'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { EventDensityData } from '@/types/game-data.types';

interface Props {
  data: EventDensityData[];
}

export default function EventDensityChart({ data }: Props) {
  const options: Highcharts.Options = {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Event Density Over Time',
    },
    xAxis: {
      title: {
        text: 'Time (seconds)',
      },
      labels: {
        formatter: function () {
          return `${Math.floor(Number(this.value) / 60)}m`;
        },
      },
    },
    yAxis: {
      title: {
        text: 'Events per Minute',
      },
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> events',
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
        },
      },
    },
    series: [
      {
        name: 'Events',
        type: 'line',
        data: data.map(d => [d.time_bucket, d.event_count]),
        color: '#ffd60a',
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
