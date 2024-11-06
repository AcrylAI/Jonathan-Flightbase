import { useEffect, useRef } from 'react';
import { PieChart as PieChartComp } from '@jonathan/ui-graph';
import { PieChartArgs } from './types';

type Props = PieChartArgs;

function PieChart({
  data,
  chartSize,
  chartFillColor,
  chartBolder,
  centerText,
  totalValue,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvas.current) {
      const param = {
        canvas: canvas.current,
        data,
        chartSize,
        chartFillColor,
        chartBolder,
        centerText,
        totalValue,
      };
      const pieChart = new PieChartComp(param);
      pieChart.draw();
    }
  }, [centerText, chartBolder, chartFillColor, chartSize, data, totalValue]);
  return <canvas ref={canvas} />;
}

export default PieChart;
