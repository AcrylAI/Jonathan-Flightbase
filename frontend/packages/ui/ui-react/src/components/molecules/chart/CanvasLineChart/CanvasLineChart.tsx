import { useEffect, useMemo } from 'react';
import { CanvasLineChart as Chart } from '@jonathan/ui-graph';

import { CanvasLineChartArgs } from './types';

type Props = CanvasLineChartArgs;

function CanvasLineChart({
  id,
  series,
  axis,
  width,
  height,
  pointSize,
  font,
  fontHeight,
  canvasStyle,
  renderOption,
}: Props) {
  const chart = useMemo(() => {
    const param = {
      nodeId: id,
      width,
      height,
      point: pointSize,
      font,
      fontHeight,
      canvasStyle,
    };
    return new Chart(param);
  }, [id, canvasStyle, font, fontHeight, height, pointSize, width]);

  useEffect(() => {
    if (chart) {
      const param = {
        series,
        axis,
      };
      chart.dataInitialize(param);
      const unmount = chart.render(renderOption);
      return () => {
        if (unmount) unmount();
      };
    }
    return undefined;
  }, [axis, chart, series, renderOption]);

  return <div id={id}></div>;
}

CanvasLineChart.defaultProps = {
  width: 1800,
  height: 700,
  pointSize: 3,
  font: 'normal bold 12px serif',
  fontHeight: 12,
  canvasStyle: undefined,
  renderOption: {
    bottomAxis: true,
    bottomTick: true,
    bottomText: true,
    leftAxis: true,
    leftTick: true,
    leftText: true,
    rightAxis: true,
    rightTick: true,
    rightText: true,
    tooltip: true,
    guideLine: true,
  },
};

export default CanvasLineChart;
