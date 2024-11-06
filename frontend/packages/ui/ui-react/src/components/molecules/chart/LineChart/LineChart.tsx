import { chartTypes, LineChartArgs } from './types';
import SingleLineChart from './SingleLineChart';
import MultiLineChart from './MultiLineChart';

type Props = LineChartArgs;

function LineChart({
  id = '',
  type = chartTypes.SINGLE,
  width = 800,
  height = 300,
  isResponsive = true,
  legend = true,
  series = [],
  data,
  xTickFormat,
}: Props) {
  // if (type === chartTypes.FILLED) {
  //   return <FilledLineChart data={data} />;
  // }

  if (type === chartTypes.MULTI) {
    return (
      <MultiLineChart
        id={id}
        width={width}
        height={height}
        isResponsive={isResponsive}
        legend={legend}
        series={series}
        data={data}
        xTickFormat={xTickFormat}
      />
    );
  }

  return (
    <SingleLineChart
      id={id}
      width={width}
      height={height}
      isResponsive={isResponsive}
      legend={legend}
      series={series}
      data={data}
      xTickFormat={xTickFormat}
    />
  );
}

LineChart.defaultProps = {
  id: '',
  type: chartTypes.SINGLE,
  width: 800,
  height: 300,
  isResponsive: true,
  legend: true,
  series: undefined,
};

export default LineChart;
