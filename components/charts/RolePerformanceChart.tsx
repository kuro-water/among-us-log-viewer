'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { RolePerformanceData } from '@/types/game-data.types';
import { getFactionColor } from '@/lib/role-mapping';

interface Props {
  data: RolePerformanceData[];
}

export default function RolePerformanceChart({ data }: Props) {
  // Sort by games played
  const sortedData = [...data].sort((a, b) => b.games_played - a.games_played).slice(0, 15);

  const options: Highcharts.Options = {
    chart: {
      type: 'bar',
    },
    title: {
      text: 'Role Performance - Average Tasks Completed',
    },
    xAxis: {
      categories: sortedData.map(r => r.role),
      title: {
        text: 'Roles',
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Average Tasks Completed',
      },
    },
    tooltip: {
      pointFormat: '<b>{point.y:.2f}</b> tasks<br/>Games: {point.games}',
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          format: '{point.y:.1f}',
        },
      },
    },
    series: [
      {
        name: 'Avg Tasks',
        type: 'bar',
        data: sortedData.map(r => ({
          y: r.avg_tasks_completed,
          games: r.games_played,
          color: getFactionColor(r.faction),
        })),
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
