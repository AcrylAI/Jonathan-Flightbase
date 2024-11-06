import React, { memo, useLayoutEffect } from 'react';

import type { DoubleLineChartDataType } from './types';

import * as am5 from '@amcharts/amcharts5';
// eslint-disable-next-line camelcase
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

type Props = {
  tagId: string;
  data: DoubleLineChartDataType;
  customStyle?: React.CSSProperties;
};

function DoubleLineChart({ tagId, data, customStyle }: Props) {
  useLayoutEffect(() => {
    if (!document.getElementById(tagId)) return () => {};

    const root = am5.Root.new(tagId);

    root.setThemes([am5themes_Animated.new(root)]);
    root.fps = 0;
    root.autoResize = false;

    // eslint-disable-next-line consistent-return
    const generateChart = () => {
      // Create chart
      // https://www.amcharts.com/docs/v5/charts/xy-chart/
      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          focusable: true,
          panX: true,
          panY: true,
          wheelX: 'panX',
          wheelY: 'zoomX',
          pinchZoomX: true,
        }),
      );
      if (!chart) return () => {};

      chart.get('colors')?.set('step', 3);

      const makeLineSeries = (
        categoryKey: string,
        valueKey: string,
        valueName: string,
        graphData: any,
        color: am5.Color,
        xVisible: boolean,
      ) => {
        const xRenderer = am5xy.AxisRendererX.new(root, {});
        xRenderer.grid.template.set('visible', false);
        const yRenderer = am5xy.AxisRendererY.new(root, {});

        const tooltip = am5.Tooltip.new(root, {
          html: `
            <div style='height: 16px; font-size: 14px; font-family: MarkerFont; overflow: hidden'>
              {categoryX} {name} : {valueY}
            </div>
          `,
        });

        tooltip.get('background')?.setAll({
          fill: color,
          opacity: 0.6,
        });

        const xAxis = chart.xAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: categoryKey,
            renderer: xRenderer,
            visible: xVisible,
          }),
        );

        xAxis.data.setAll(graphData);

        const yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: yRenderer,
            visible: false,
            min: 0,
          }),
        );

        const series = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: valueName,
            xAxis,
            yAxis,
            valueYField: valueKey,
            categoryXField: categoryKey,
            fill: color,
            tooltip,
          }),
        );

        series.set('stroke', color);

        series.strokes.template.setAll({
          strokeWidth: 3,
          templateField: 'strokeSettings',
        });

        series.data.setAll(graphData);
      };

      makeLineSeries(
        data.categoryKey,
        data.valueKey1,
        data.valueName1,
        data.value1,
        data.color1,
        true,
      );
      makeLineSeries(
        data.categoryKey,
        data.valueKey2,
        data.valueName2,
        data.value2,
        data.color2,
        false,
      );

      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.percent(100),
          x: am5.percent(100),
          y: am5.percent(-10),
          interactive: true,
          layout: am5.GridLayout.new(root, {
            maxColumns: 3,
            fixedWidthGrid: true,
          }),
        }),
      );

      legend.valueLabels.template.setAll({
        textAlign: 'end',
        fontSize: 12,
        fontFamily: 'MarkerFont',
      });
      legend.labels.template.setAll({
        fontSize: 12,
        fontWeight: '500',
      });
      legend.data.setAll(chart.series.values);
      legend.markers.getIndex(0)?.setAll({
        opacity: 0.6,
      });
      legend.markers.getIndex(1)?.setAll({
        opacity: 0.6,
      });

      chart.set(
        'scrollbarX',
        am5.Scrollbar.new(root, {
          orientation: 'horizontal',
          marginTop: 27,
        }),
      );

      const scrollbarX = chart.get('scrollbarX') as am5.Scrollbar;
      chart.bottomAxesContainer.children.push(scrollbarX);

      const cursor = chart.set(
        'cursor',
        am5xy.XYCursor.new(root, {
          behavior: 'selectX',
        }),
      );
      cursor.lineY.set('visible', false);
    };

    generateChart();

    return () => {
      root.dispose();
    };
  }, [data, tagId]);

  return (
    <div
      id={tagId}
      style={{
        width: '100%',
        height: '100%',
        ...customStyle,
      }}
    ></div>
  );
}

DoubleLineChart.defaultProps = {
  customStyle: undefined,
};

export default memo(
  DoubleLineChart,
  (prev, next) => JSON.stringify(prev.data) === JSON.stringify(next.data),
);
