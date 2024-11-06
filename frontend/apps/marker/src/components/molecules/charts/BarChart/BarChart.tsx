// eslint-disable-next-line simple-import-sort/imports
import React, { memo, useLayoutEffect } from 'react';

import type { DataType } from './types';

import * as am5 from '@amcharts/amcharts5';

// eslint-disable-next-line camelcase
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
// eslint-disable-next-line camelcase
import * as am5xy from '@amcharts/amcharts5/xy';

type Props = {
  tagId: string;
  data: DataType;
  max?: number;
  min?: number;
  chartHeight?: number;
  customStyle?: React.CSSProperties;
};

function BarChart({ tagId, data, max, min, chartHeight, customStyle }: Props) {
  useLayoutEffect(() => {
    const { category, value, data: d } = data;

    const colors: Array<am5.Color> = d.map(
      ({ color }) => color as unknown as am5.Color,
    );

    const root = am5.Root.new(tagId);

    const barChartTheme = am5.Theme.new(root);
    if (colors.length > 0) {
      barChartTheme.rule('ColorSet').set('colors', colors);
    }

    // const customTheme = am5.Theme.new(root);
    // customTheme.rule('Grid').setAll({});

    root.setThemes([am5themes_Animated.new(root), barChartTheme]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        y: am5.percent(15),
        layout: root.verticalLayout,
        height: chartHeight,
      }),
    );

    let curMax: number = max === undefined ? 0 : max;
    if (max === undefined) {
      d.forEach((cur) => {
        const v = Number(cur[data.value]);
        if (!Number.isNaN(v)) {
          curMax = Math.max(v, curMax);
        }
      });

      if (curMax < 5) {
        curMax = 5;
      }
    }

    const tooltip = am5.Tooltip.new(root, {
      html: `
        <div style='height: 16px; font-size: 14px; font-family: MarkerFont; overflow: hidden; color: #000000; width: 100%;'>
          {${data.xText}} : {valueY}
        </div>
      `,
    });

    tooltip.get('background')?.setAll({
      opacity: 0.6,
    });

    const xRenderer = am5xy.AxisRendererX.new(root, {
      cellStartLocation: 0.3,
      cellEndLocation: 0.7,
    });

    xRenderer.labels.template.setAll({
      html: `
        <div style='font-size: 12px; font-family: MarkerFont; white-space: nowrap;'>
          {${data.xText}}
        </div>
      `,
    });

    const yRenderer: am5xy.AxisRendererY = am5xy.AxisRendererY.new(root, {
      // minGridDistance: 70,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: category,
        renderer: xRenderer,
      }),
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
        max: curMax,
        min,
        // visible: false,
      }),
    );

    xAxis.data.setAll(d);

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: category,
        xAxis,
        yAxis,
        valueYField: value,
        categoryXField: category,
        tooltip,
      }),
    );

    series.columns.template.setAll({
      width: am5.percent(24),
      cornerRadiusBR: 2,
      cornerRadiusBL: 2,
      cornerRadiusTR: 5,
      cornerRadiusTL: 5,
    });

    series.columns.template.adapters.add('fill', (_, target) => {
      return chart.get('colors')?.getIndex(series.columns.indexOf(target));
    });

    series.columns.template.adapters.add('stroke', (_, target) => {
      return chart.get('colors')?.getIndex(series.columns.indexOf(target));
    });

    series.data.setAll(d);

    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(root, {
        orientation: 'horizontal',
      }),
    );

    const scrollbarX = chart.get('scrollbarX') as am5.Scrollbar;
    if (scrollbarX) {
      chart.set('scrollbarX', scrollbarX);
      chart.bottomAxesContainer.children.push(scrollbarX);
      if (d.length > 5) {
        scrollbarX.setAll({
          start: 0,
          end: 5 / d.length,
        });
      }
    }

    const cursor = chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'selectX',
      }),
    );
    cursor.lineY.set('visible', false);

    return () => {
      root.dispose();
    };
  }, [tagId, data, chartHeight, max, min]);

  return <div id={tagId} style={customStyle}></div>;
}

BarChart.defaultProps = {
  customStyle: {
    width: '100%',
    height: '550px',
  },
  max: undefined,
  min: undefined,
  chartHeight: 300,
};

export default memo(
  BarChart,
  (prev, next) => JSON.stringify(prev) === JSON.stringify(next),
);
