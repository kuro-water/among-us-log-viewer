'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FactionWinData } from '@/types/game-data.types';
import { getFactionColor } from '@/lib/role-mapping';

interface Props {
  data: FactionWinData[];
}

export default function FactionWinRateChart({ data }: Props) {
  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
    },
    title: {
      text: 'Faction Win Rate',
    },
    tooltip: {
      pointFormat: '<b>{point.percentage:.1f}%</b><br/>Wins: {point.y}<br/>Total: {point.total}',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
        },
      },
    },
    series: [
      {
        name: 'Factions',
        type: 'pie',
        data: data.map(faction => ({
          name: faction.faction,
          y: faction.wins,
          total: faction.games,
          color: getFactionColor(faction.faction),
        })),
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
