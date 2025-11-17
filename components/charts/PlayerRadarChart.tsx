'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { PlayerRadarData } from '@/types/game-data.types';
import { useEffect, useState } from 'react';

interface Props {
  data: PlayerRadarData;
}

export default function PlayerRadarChart({ data }: Props) {
  const [moreLoaded, setMoreLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import more module for polar charts
    import('highcharts/highcharts-more').then((module: any) => {
      module.default(Highcharts);
      setMoreLoaded(true);
    });
  }, []);

  if (!moreLoaded) {
    return <div>Loading...</div>;
  }

  const options: Highcharts.Options = {
    chart: {
      polar: true,
      type: 'line',
    },
    title: {
      text: `${data.player_name} - Performance Radar`,
    },
    pane: {
      size: '80%',
    },
    xAxis: {
      categories: ['Kills', 'Tasks', 'Movement', 'Sabotages', 'Survival'],
      tickmarkPlacement: 'on',
      lineWidth: 0,
    },
    yAxis: {
      gridLineInterpolation: 'polygon',
      lineWidth: 0,
      min: 0,
    },
    tooltip: {
      shared: true,
      pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:.2f}</b><br/>',
    },
    series: [
      {
        name: data.player_name,
        type: 'line',
        data: [
          data.kills,
          data.tasks_completed,
          data.movement_distance / 100, // Scale down for visibility
          data.sabotages,
          1 - data.deaths, // Inverse of deaths for survival
        ],
        pointPlacement: 'on',
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
