'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { PlayerWinData } from '@/types/game-data.types';

interface Props {
  data: PlayerWinData[];
}

export default function PlayerWinRateChart({ data }: Props) {
  const options: Highcharts.Options = {
    chart: {
      type: 'column',
    },
    title: {
      text: 'Player Win Rate',
    },
    xAxis: {
      categories: data.map(p => p.player_name),
      title: {
        text: 'Players',
      },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'Win Rate (%)',
      },
    },
    tooltip: {
      pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.1f}%)<br/>',
      shared: true,
    },
    plotOptions: {
      column: {
        stacking: 'percent',
      },
    },
    series: [
      {
        name: 'Wins',
        type: 'column',
        data: data.map(p => p.wins),
        color: '#00e272',
      },
      {
        name: 'Losses',
        type: 'column',
        data: data.map(p => p.losses),
        color: '#fe6a35',
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
