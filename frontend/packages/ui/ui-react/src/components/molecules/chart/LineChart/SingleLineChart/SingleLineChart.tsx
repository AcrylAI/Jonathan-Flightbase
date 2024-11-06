import { useMemo, useEffect } from 'react';
import { LineChart as LineChartComp } from '@jonathan/ui-graph';
import { SeriesType, DataType } from '../types';

type Props = {
  id: string;
  width: number;
  height: number;
  isResponsive: boolean;
  legend: boolean;
  series: Array<SeriesType>;
  data: Array<DataType>;
  xTickFormat: any;
};

function SingleLineChart({
  id,
  width,
  height,
  isResponsive,
  legend,
  series,
  data,
  xTickFormat,
}: Props) {
  const lineChart = useMemo(
    () =>
      new LineChartComp({
        eleId: id,
        width,
        height,
        isResponsive,
        legend,
        xAxisMaxTicks: 6,
        tooltip: {
          align: 'right',
        },
      }),
    [height, id, isResponsive, legend, width],
  );

  useEffect(() => {
    if (lineChart) {
      lineChart.init(data);
      lineChart.setSeries(series);
      lineChart.draw();
    }
  }, [lineChart, data, series]);

  useEffect(() => {
    if (lineChart) {
      lineChart.updateOption({
        width,
        height,
        isResponsive,
        legend,
        xTickFormat,
      });
      lineChart.draw(data);
    }
  }, [lineChart, data, width, height, isResponsive, legend, xTickFormat]);

  return <div id={id}></div>;
}

export default SingleLineChart;
