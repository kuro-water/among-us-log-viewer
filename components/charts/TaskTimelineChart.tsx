'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { TaskTimelineData } from '@/types/game-data.types';

interface Props {
  data: TaskTimelineData[];
}

export default function TaskTimelineChart({ data }: Props) {
  const options: Highcharts.Options = {
    chart: {
      type: 'area',
    },
    title: {
      text: 'Task Completion Timeline',
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
        text: 'Total Tasks Completed',
      },
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> tasks<br/>Time: {point.x}s',
    },
    plotOptions: {
      area: {
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 2,
        },
        lineColor: '#00e272',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(0, 226, 114, 0.5)'],
            [1, 'rgba(0, 226, 114, 0.1)'],
          ],
        },
      },
    },
    series: [
      {
        name: 'Tasks',
        type: 'area',
        data: data.map(d => [d.elapsed_time, d.total_tasks_completed]),
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
