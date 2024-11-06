import { useEffect, useRef } from 'react';

import { BarLineChart as Chart } from '@jonathan/ui-graph';
import { BarLineChartData } from './types';

type Props = {
  data?: BarLineChartData;
  width?: number;
  height?: number;
  minXAxis?: number;
  minYAxis?: number;
  maxXAxis?: number;
  maxYAxis?: number;
  unitsPerTickX?: number;
  unitsPerTickY?: number;
  axisColor?: string;
  point?: number;
  barWidth?: number;
  lineChartColor?: string;
  barChartColor?: string;
  drawXAxis?: boolean;
  drawXValue?: boolean;
  drawXTick?: boolean;
  drawYAxis?: boolean;
  drawYValue?: boolean;
  drawYTick?: boolean;
  activeTooltip?: boolean;
  tooltipStyle?: { [key: string]: string };
  isAxisDraw?: boolean;
  background?: string;
};

function BarLineChart({
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
  point,
  barWidth,
  lineChartColor,
  barChartColor,
  drawXAxis,
  drawXValue,
  drawXTick,
  drawYAxis,
  drawYValue,
  drawYTick,
  activeTooltip,
  tooltipStyle,
  isAxisDraw,
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
        minXAxis,
        minYAxis,
        maxXAxis,
        maxYAxis,
        unitsPerTickX,
        unitsPerTickY,
        axisColor,
        point,
        barWidth,
        lineChartColor,
        barChartColor,
        isAxisDraw,
        background,
      };
      const barLineChart = new Chart(param);
      const drawParam = {
        drawXAxis,
        drawXValue,
        drawXTick,
        drawYAxis,
        drawYValue,
        drawYTick,
        activeTooltip,
        tooltipStyle,
      };
      barLineChart.draw(drawParam);
    }
  }, [
    canvasRef,
    activeTooltip,
    axisColor,
    barChartColor,
    barWidth,
    data,
    drawXAxis,
    drawXTick,
    drawXValue,
    drawYAxis,
    drawYTick,
    drawYValue,
    height,
    lineChartColor,
    maxXAxis,
    maxYAxis,
    minXAxis,
    minYAxis,
    point,
    tooltipStyle,
    unitsPerTickX,
    unitsPerTickY,
    width,
    isAxisDraw,
    background,
  ]);

  return <canvas ref={canvasRef} />;
}

BarLineChart.defaultProps = {
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
  point: undefined,
  barWidth: undefined,
  lineChartColor: undefined,
  barChartColor: undefined,
  drawXAxis: undefined,
  drawXValue: undefined,
  drawXTick: undefined,
  drawYAxis: undefined,
  drawYValue: undefined,
  drawYTick: undefined,
  activeTooltip: undefined,
  tooltipStyle: undefined,
  isAxisDraw: undefined,
  background: undefined,
};

export default BarLineChart;
