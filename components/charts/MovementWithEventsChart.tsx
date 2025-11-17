'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { MovementWithEventsData } from '@/types/game-data.types';

interface Props {
  data: MovementWithEventsData;
}

export default function MovementWithEventsChart({ data }: Props) {
  const options: Highcharts.Options = {
    chart: {
      type: 'spline',
    },
    title: {
      text: `${data.player_name} - Movement with Events`,
    },
    xAxis: {
      title: {
        text: 'Elapsed Time (seconds)',
      },
      labels: {
        formatter: function () {
          return `${Math.floor(Number(this.value) / 60)}m`;
        },
      },
    },
    yAxis: {
      title: {
        text: 'Cumulative Distance',
      },
    },
    tooltip: {
      shared: true,
    },
    plotOptions: {
      spline: {
        marker: {
          radius: 4,
          lineColor: '#666666',
          lineWidth: 1,
        },
      },
    },
    series: [
      {
        name: 'Movement',
        type: 'spline',
        data: data.snapshots.map(s => [s.elapsed_time, s.cumulative_distance]),
        color: '#00e272',
      },
      {
        name: 'Events',
        type: 'scatter',
        data: data.events.map(e => ({
          x: e.elapsed_time,
          y: 0, // Place events at y=0 or find corresponding distance
          marker: {
            symbol: 'diamond',
            radius: 6,
          },
          name: e.event_type,
        })),
        color: '#fe6a35',
        marker: {
          symbol: 'diamond',
        },
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
