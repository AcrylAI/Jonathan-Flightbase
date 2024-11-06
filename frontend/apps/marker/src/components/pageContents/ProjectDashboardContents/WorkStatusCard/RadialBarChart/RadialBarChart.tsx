import React, { memo, useEffect } from 'react';

import { MONO202 } from '@src/utils/color';

import type { RadialBarChartType } from './types';

import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
// eslint-disable-next-line camelcase
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

type Props = {
  tagId: string;
  data: RadialBarChartType;
  customStyle?: React.CSSProperties;
};

function RadialBarChart({ tagId, data, customStyle }: Props) {
  // const isMount = useRef<boolean>(false);

  useEffect(() => {
    if (!document.getElementById(tagId)) return () => {};
    const root = am5.Root.new(tagId);
    root.setThemes([am5themes_Animated.new(root)]);

    let isInnerTotalData = false;
    let isOuterTotalData = false;
    for (let i = 0; i < data.innerData.length; i++) {
      if (data.innerData[i].value > 0) {
        isInnerTotalData = true;
        break;
      }
    }
    for (let i = 0; i < data.outerData.length; i++) {
      if (data.outerData[i].value > 0) {
        isOuterTotalData = true;
        break;
      }
    }

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    // start and end angle must be set both for chart and series
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(40),
      }),
    );

    const bgColor = root.interfaceColors.get('background');

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    // start and end angle must be set both for chart and series
    const series0: am5percent.PieSeries = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: 'value',
        categoryField: 'category',
        alignLabels: true,
      }),
    );

    series0.ticks.template.setAll({ forceHidden: true });
    series0.labels.template.setAll({ forceHidden: true });

    series0.slices.template.setAll({
      stroke: bgColor,
      strokeWidth: 2,
      tooltipHTML: `
        <div style='height: 16px; font-size: 14px; font-family: MarkerFont; overflow: hidden'>
          {name}: {valuePercentTotal.formatNumber('0.0')}%
        </div>
      `,
    });

    series0.slices.template.states.create('hover', { scale: 0.95 });
    if (isInnerTotalData) {
      series0.get('colors')?.set('colors', data.innerDataColors);
      series0.data.setAll(data.innerData);
      series0.slices.template.states.create('active', {
        shiftRadius: 0,
      });
    } else {
      series0.get('colors')?.set('colors', [MONO202 as unknown as am5.Color]);
      series0.data.setAll([{ value: 1 }]);
    }

    const series1 = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: 'value',
        categoryField: 'category',
        alignLabels: true,
      }),
    );

    series1.ticks.template.setAll({ forceHidden: true });
    series1.labels.template.setAll({ forceHidden: true });

    series1.slices.template.setAll({
      stroke: bgColor,
      strokeWidth: 2,
      tooltipHTML: `
        <div style='height: 16px; font-size: 14px; font-family: MarkerFont; overflow: hidden'>
          {name}: {valuePercentTotal.formatNumber('0.0')}%
        </div>
      `,
    });

    if (isOuterTotalData) {
      series1.get('colors')?.set('colors', data.outerDataColors);
      series1.data.setAll(data.outerData);
      series1.slices.template.states.create('active', {
        shiftRadius: 0,
      });
    } else {
      series1.get('colors')?.set('colors', [MONO202 as unknown as am5.Color]);
      series1.data.setAll([{ value: 1 }]);
    }

    // Play initial series animation
    // https://www.amcharts.com/docs/v5/concepts/animations/#Animation_of_series
    // if (!isMount.current) {
    //   isMount.current = true;
    //   series0.appear(1000, 100);
    //   series1.appear(1000, 100);
    // }

    return () => {
      root.dispose();
    };
  }, [data, tagId]);

  return (
    <div
      id={tagId}
      style={{
        ...customStyle,
        pointerEvents: (() => {
          let isInnerTotalData = false;
          let isOuterTotalData = false;
          for (let i = 0; i < data.innerData.length; i++) {
            if (data.innerData[i].value > 0) {
              isInnerTotalData = true;
              break;
            }
          }
          for (let i = 0; i < data.outerData.length; i++) {
            if (data.outerData[i].value > 0) {
              isOuterTotalData = true;
              break;
            }
          }

          if (!isInnerTotalData && !isOuterTotalData) {
            return 'none';
          }

          return 'auto';
        })(),
      }}
    ></div>
  );
}

RadialBarChart.defaultProps = {
  customStyle: {
    width: '100%',
    height: '232px',
  },
};

export default memo(
  RadialBarChart,
  (prev, next) => JSON.stringify(prev.data) === JSON.stringify(next.data),
);
