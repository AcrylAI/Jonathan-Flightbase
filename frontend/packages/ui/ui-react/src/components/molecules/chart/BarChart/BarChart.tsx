import { useEffect, useRef } from 'react';

import { BarChart as Chart } from '@jonathan/ui-graph';

import { BarChartData, DrawParam } from './types';

type Props = {
  data?: BarChartData;
  width?: number;
  height?: number;
  minXAxis?: number;
  minYAxis?: number;
  maxXAxis?: number;
  maxYAxis?: number;
  unitsPerTickX?: number;
  unitsPerTickY?: number;
  axisColor?: string;
  barWidth?: number;
  barColor?: string;
  isAxisDraw?: boolean;
  drawXAxis?: boolean;
  drawXValue?: boolean;
  drawXTick?: boolean;
  drawYAxis?: boolean;
  drawYValue?: boolean;
  drawYTick?: boolean;
  background?: string;
};

function BarChart({
  data,
  width,
  height,
  minXAxis,
  minYAxis,
  maxXAxis,
  maxYAxis,
  unitsPerTickX,
  unitsPerTickY,
  axisColor,
  barWidth,
  barColor,
  isAxisDraw,
  drawXAxis,
  drawXValue,
  drawXTick,
  drawYAxis,
  drawYValue,
  drawYTick,
  background,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && data?.data) {
      const param = {
        canvas,
        data,
        width,
        height,
        maxXAxis,
        minXAxis,
        maxYAxis,
        minYAxis,
        unitsPerTickX,
        unitsPerTickY,
        axisColor,
        barWidth,
        barColor,
        isAxisDraw,
        background,
      };
      const barChart = new Chart(param);
      const drawParam: DrawParam = {
        drawXAxis,
        drawXValue,
        drawXTick,
        drawYAxis,
        drawYValue,
        drawYTick,
      };
      barChart.draw(drawParam);
    }
  }, [
    data,
    width,
    height,
    minXAxis,
    minYAxis,
    maxXAxis,
    maxYAxis,
    unitsPerTickX,
    unitsPerTickY,
    axisColor,
    barWidth,
    barColor,
    isAxisDraw,
    drawXAxis,
    drawXValue,
    drawXTick,
    drawYAxis,
    drawYValue,
    drawYTick,
    background,
  ]);

  return <canvas ref={canvasRef} />;
}

BarChart.defaultProps = {
  data: [],
  width: undefined,
  height: undefined,
  minXAxis: undefined,
  minYAxis: undefined,
  maxXAxis: undefined,
  maxYAxis: undefined,
  unitsPerTickX: undefined,
  unitsPerTickY: undefined,
  axisColor: undefined,
  barWidth: undefined,
  barColor: undefined,
  drawXAxis: undefined,
  drawXValue: undefined,
  drawXTick: undefined,
  drawYAxis: undefined,
  drawYValue: undefined,
  drawYTick: undefined,
  isAxisDraw: undefined,
  background: undefined,
};

export default BarChart;
