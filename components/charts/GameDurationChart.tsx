'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { GameDurationData } from '@/types/game-data.types';

interface Props {
  data: GameDurationData[];
}

export default function GameDurationChart({ data }: Props) {
  // Create histogram data
  const durations = data.map(d => d.duration_seconds);

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
    },
    title: {
      text: 'Game Duration Distribution',
    },
    xAxis: {
      title: {
        text: 'Duration (seconds)',
      },
    },
    yAxis: {
      title: {
        text: 'Frequency',
      },
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> games',
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
        groupPadding: 0,
        shadow: false,
      },
    },
    series: [
      {
        name: 'Games',
        type: 'column',
        data: durations,
        color: '#00e272',
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
