import { useEffect, useCallback } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

// i18n
import { useTranslation } from 'react-i18next';

let chart;
let root;
const ColumnChart = ({
  tagId,
  data = [],
  average,
  min,
  max,
  customStyle = {},
}) => {
  const { t } = useTranslation();
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
        paddingRight: 36,
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
      strokeOpacity: 0,
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
        min: 0,
      }),
    );

    // Create a range
    let averageRangeDataItem = yAxis.makeDataItem({
      value: average,
      // above: true,
      // affectsMinMax: true,
    });

    let minRangeDataItem = yAxis.makeDataItem({
      value: min,
      // above: true,
      // affectsMinMax: true,
    });

    let maxRangeDataItem = yAxis.makeDataItem({
      value: max,
      // above: true,
      // affectsMinMax: true,
    });

    yAxis.createAxisRange(averageRangeDataItem);
    yAxis.createAxisRange(minRangeDataItem);
    yAxis.createAxisRange(maxRangeDataItem);

    averageRangeDataItem.get('grid').setAll({
      stroke: am5.color('#27d478'),
      strokeOpacity: 1,
    });

    minRangeDataItem.get('grid').setAll({
      stroke: am5.color('#FBB170'),
      strokeOpacity: 1,
    });

    maxRangeDataItem.get('grid').setAll({
      stroke: am5.color('#E870EC'),
      strokeOpacity: 1,
    });

    // const averageLabel = rangeDataItem.get('label');

    // averageLabel.setAll({
    //   fill: am5.color(0xffffff),
    //   text: `Avg. ${average.toFixed(2)}`,
    //   background: am5.Rectangle.new(root, {
    //     fill: '#27d478',
    //   }),
    //   inside: true,
    //   centerX: am5.p100,
    //   centerY: 90,
    // });

    // averageLabel.adapters.add('x', (x, target) => {
    //   return chart.plotContainer.width();
    // });

    // chart.plotContainer.onPrivate('width', () => {
    //   averageLabel.markDirtyPosition();
    // });

    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'count',
        sequencedInterpolation: true,
        categoryXField: 'label',
        tooltip: am5.Tooltip.new(root, {
          // labelText: '{valueY}',
        }),
      }),
    );

    let tooltip = series.set(
      'tooltip',
      am5.Tooltip.new(root, {
        getFillFromSprite: false,
        autoTextColor: false,
      }),
    );

    // 툴팁박스 내용
    tooltip.label.set(
      'text',
      ` [width: 50px, fontSize: 13px]${t(
        'class.label',
      )}[#ffffff, fontSize: 13px]{label} \n[/] [width: 50px, fontSize: 13px]${t(
        'dataCountUnit.label',
      )}[#ffffff, fontSize: 13px]{count}[/]`,
    );
    tooltip.label.setAll({
      fill: '#c2c2c2',
    });

    // 툴팁박스 배경색
    tooltip.get('background').setAll({
      fill: '#423f4a',
      stroke: '#423f4a',
    });

    series.columns.template.setAll({
      cornerRadiusTL: 2,
      cornerRadiusTR: 2,
      fill: am5.color(0x4494e4),
      width: am5.percent(40),
    });

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
      cornerRadiusTR: 0,
      cornerRadiusBR: 0,
      cornerRadiusTL: 0,
      cornerRadiusBL: 0,
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
  }, [average, data, max, min, t, tagId]);

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

export default ColumnChart;
