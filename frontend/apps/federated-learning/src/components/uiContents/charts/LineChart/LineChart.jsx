import { useEffect, useCallback } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

let chart;
let root;
const LineChart = ({ tagId, data = [], customStyle = {} }) => {
  const generateChart = useCallback(() => {
    if (!document.getElementById(tagId) || data.length === 0) return;

    root = am5.Root.new(tagId);
    root.setThemes([am5themes_Animated.new(root)]);

    chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        // wheelX: 'panX',
        // wheelY: 'zoomX',
        pinchZoomX: true,
        above: true,
      }),
    );

    // color
    chart
      .get('colors')
      .set('colors', [
        am5.color(0x4494e4),
        am5.color(0x35b7eb),
        am5.color(0x3bd8ca),
        am5.color(0x46f79c),
        am5.color(0x96da44),
        am5.color(0xf9e856),
        am5.color(0xfac759),
        am5.color(0xffb17f),
        am5.color(0xfe9ca8),
        am5.color(0xfe86d2),
        am5.color(0xf577f1),
        am5.color(0xd07df4),
        am5.color(0xab82f7),
        am5.color(0x8888fa),
        am5.color(0x5190ff),
      ]);

    // Add cursor
    let cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}));
    cursor.lineY.set('visible', false);

    let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
    xRenderer.labels.template.setAll({
      rotation: -60,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 5,
      fontSize: 12,
      fill: am5.color(0xffffff),
    });

    xRenderer.grid.template.setAll({
      strokeOpacity: 0.5,
      stroke: am5.color(0x5f5f5f),
      strokeWidth: 1,
    });

    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: 'label',
        tooltip: am5.Tooltip.new(root, {}),
        renderer: xRenderer,
      }),
    );

    let yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.labels.template.setAll({
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 13,
      fontSize: 12,
      fill: am5.color(0xffffff),
    });

    yRenderer.grid.template.setAll({
      stroke: am5.color(0x5f5f5f),
      strokeWidth: 2,
    });

    yRenderer.ticks.template.setAll({
      minPosition: 0.1,
      maxPosition: 0.9,
      visible: true,
    });

    yRenderer.labels.template.setAll({
      minPosition: 0.1,
      maxPosition: 0.9,
    });

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: yRenderer,
      }),
    );

    let series = chart.series.push(
      am5xy.LineSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'target',
        sequencedInterpolation: true,
        categoryXField: 'label',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{valueY}',
        }),
      }),
    );

    xAxis.data.setAll(data);
    series.data.setAll(data);

    // 줌 버튼 컬러
    root.interfaceColors.setAll({
      primaryButton: '#5089f0',
      primaryButtonHover: '#2d76f8',
      primaryButtonDown: '#2d76f8',
      primaryButtonActive: '#2d76f8',
    });

    // Add scrollbar
    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(root, {
        orientation: 'horizontal',
      }),
    );
    let scrollbarX = chart.get('scrollbarX');

    scrollbarX.get('background').setAll({
      fill: '#53505b',
      height: 5,
    });

    chart.set('scrollbarX', scrollbarX);
    chart.bottomAxesContainer.children.push(scrollbarX);

    scrollbarX.endGrip.get('background').setAll({
      stroke: '#c2c2c2',
      strokeWidth: 2,
      draw: function (display) {
        display.drawRect(-5, 9, 40, 12);
      },
    });
    scrollbarX.startGrip.get('background').setAll({
      stroke: '#c2c2c2',
      strokeWidth: 2,
      draw: function (display) {
        display.drawRect(-5, 9, 40, 12);
      },
    });
    series.appear(1000, 100);
    chart.appear(1000, 100);
  }, [data, tagId]);

  useEffect(() => {
    if (data.length > 0) {
      generateChart();
    }
    return () => {
      if (root) root.dispose();
    };
  }, [data, generateChart]);
  return <div id={tagId} style={customStyle}></div>;
};

export default LineChart;
