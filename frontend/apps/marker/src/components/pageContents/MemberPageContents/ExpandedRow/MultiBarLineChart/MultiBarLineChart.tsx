import React, { memo, useEffect, useState } from 'react';

import { BLUE101, BLUE104, MONO200, ORANGE402, RED502 } from '@src/utils/color';

import type { DataType } from './types';

import * as am5 from '@amcharts/amcharts5';
// eslint-disable-next-line camelcase
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

type Props = {
  tagId: string;
  data: DataType;
  customStyle?: React.CSSProperties;
};

function MultiBarLineChart({ tagId, data, customStyle }: Props) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
  });

  const resizeHandler = () => {
    setWindowSize({
      width: window.innerWidth,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  useEffect(() => {
    if (!document.getElementById(tagId)) return;

    const {
      category: { dataKey: categoryKey },
      bar1: { name: bar1Name, dataKey: bar1Key },
      bar2: { name: bar2Name, dataKey: bar2Key },
      line: { name: lineName, dataKey: lineKey },
      data: graphData,
    } = data;

    const root = am5.Root.new(tagId);

    root.setThemes([am5themes_Animated.new(root)]);

    root.autoResize = false;

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        y: am5.percent(15),
        layout: root.verticalLayout,
        height: 400,
      }),
    );

    chart.get('background')?.setAll({
      draw(display) {
        const canvas = display.getCanvas();
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.lineWidth = 10;

          // Wall
          ctx.strokeRect(75, 140, 150, 110);

          // Door
          ctx.fillRect(130, 190, 40, 60);

          // Roof
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();
          ctx.stroke();

          ctx.restore();
        }
      },
    });

    const xRenderer = am5xy.AxisRendererX.new(root, {
      cellStartLocation: 0.3,
      cellEndLocation: 0.7,
    });

    xRenderer.grid.template.set('visible', false);

    xRenderer.labels.template.setAll({
      fontSize: 12,
      fontFamily: 'MarkerFont',
      textAlign: 'right',
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: categoryKey,
        renderer: xRenderer,
      }),
    );

    xAxis.data.setAll(graphData);

    const yRenderer = am5xy.AxisRendererY.new(root, {});

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
        visible: false,
        min: 0,
      }),
    );

    const makeBarSeries = (
      name: string,
      valueYField: string,
      color: string,
    ) => {
      const tooltip = am5.Tooltip.new(root, {
        pointerOrientation: 'horizontal',
        html: `
          <div style='height: 16px; font-size: 14px; font-family: MarkerFont; overflow: hidden'>
            {categoryX} {name} : {valueY}
          </div>
        `,
      });

      tooltip.get('background')?.setAll({
        opacity: 0.6,
        // fill: am5.color(0xeeeeee),
      });

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          opacity: 0.6,
          name,
          xAxis,
          yAxis,
          valueYField,
          categoryXField: categoryKey,
          fill: color as unknown as am5.Color,
          tooltip,
        }),
      );

      series.columns.template.setAll({
        width: am5.percent(60),
        cornerRadiusBR: 2,
        cornerRadiusBL: 2,
        cornerRadiusTR: 5,
        cornerRadiusTL: 5,
      });

      series.data.setAll(graphData);
    };

    const makeLineSeries = (color: string) => {
      const xRenderer = am5xy.AxisRendererX.new(root, {});
      xRenderer.grid.template.set('visible', false);
      const col = color as unknown as am5.Color;

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: categoryKey,
          renderer: xRenderer,
          visible: false,
        }),
      );

      xAxis.data.setAll(graphData);

      const tooltip = am5.Tooltip.new(root, {
        html: `
          <div style='height: 16px; font-size: 14px; font-family: MarkerFont; overflow: hidden'>
            {categoryX} {name} : {valueY}
          </div>
        `,
      });

      tooltip.get('background')?.setAll({
        opacity: 0.6,
      });

      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: lineName,
          xAxis,
          yAxis,
          valueYField: lineKey,
          categoryXField: categoryKey,
          stroke: col,
          fill: col,
          tooltip,
          legendLabelText: `{name}`,
        }),
      );

      series.strokes.template.setAll({
        strokeWidth: 3,
        templateField: 'strokeSettings',
      });

      series.bullets.push(() => {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            strokeWidth: 2,
            stroke: col,
            fill: col,
            radius: 0,
            draw: (display) => {
              display.drawRect(-2, -2, 4, 4);
            },
          }),
        });
      });

      series.data.setAll(graphData);
    };

    makeBarSeries(bar1Name, bar1Key, BLUE104);
    makeBarSeries(bar2Name, bar2Key, ORANGE402);
    makeLineSeries(RED502);

    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(root, {
        orientation: 'horizontal',
        marginTop: 27,
      }),
    );

    const scrollbarX = chart.get('scrollbarX') as am5.Scrollbar;
    chart.bottomAxesContainer.children.push(scrollbarX);
    scrollbarX.get('background')?.setAll({
      fill: MONO200 as unknown as am5.Color,
      stroke: BLUE101 as unknown as am5.Color,
      marginTop: 20,
    });

    let maxColumns = 3;
    let x = am5.percent(100);
    let y = am5.percent(-10);
    if (windowSize.width <= 768) {
      maxColumns = 1;
      x = am5.percent(95);
      y = am5.percent(-17);
    } else if (windowSize.width <= 820) {
      maxColumns = 1;
      y = am5.percent(-15);
    } else if (windowSize.width <= 1024) {
      x = am5.percent(105);
      y = am5.percent(-10);
    } else if (windowSize.width >= 1440) {
      y = am5.percent(-10);
    }

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(100),
        x,
        y,
        fillField: 'color',
        layout: am5.GridLayout.new(root, {
          maxColumns,
          // fixedWidthGrid: true,
        }),
      }),
    );

    legend.labels.template.setAll({
      textAlign: 'end',
      fontSize: 12,
      fontFamily: 'MarkerFont',
    });
    legend.data.setAll(chart.series.values);

    legend.markers.getIndex(0)?.setAll({
      opacity: 0.6,
    });
    legend.markers.getIndex(1)?.setAll({
      opacity: 0.6,
    });

    const cursor = chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'selectX',
      }),
    );
    cursor.lineY.set('visible', false);

    // eslint-disable-next-line consistent-return
    return () => {
      root.dispose();
    };
  }, [data, tagId, windowSize]);

  return <div id={tagId} style={customStyle}></div>;
}

MultiBarLineChart.defaultProps = {
  customStyle: {
    width: '100%',
    height: '450px',
  },
};

export default memo(
  MultiBarLineChart,
  (prev, next) => JSON.stringify(prev.data) === JSON.stringify(next.data),
);
