import { useEffect, useCallback } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

let chart;
let root;
const StackedColumnChart = ({
  tagId,
  data = [],
  customStyle = {},
  labelRotation = -60,
}) => {
  const generateChart = useCallback(() => {
    if (!document.getElementById(tagId) || data.length === 0) return;

    const valueKeys = Object.keys(data[0]);

    for (let i = 0; i < valueKeys.length; i++) {
      if (valueKeys[i] === 'label') {
        valueKeys.splice(i, 1);
        i--;
      }
    }

    root = am5.Root.new(tagId);
    root.setThemes([am5themes_Animated.new(root)]);

    chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        // wheelX: 'panX',
        // wheelY: 'zoomX',
        layout: root.verticalLayout,
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
      rotation: labelRotation,
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
        categoryField: 'label',
        tooltip: am5.Tooltip.new(root, {}),
        renderer: xRenderer,
      }),
    );

    xAxis.data.setAll(data);

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

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        numberFormat: '#',
        strictMinMax: true,
        calculateTotals: true,
        renderer: yRenderer,
      }),
    );

    // Add legend
    let legend = chart.children.unshift(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        marginBottom: 16,
        clickTarget: 'none',
      }),
    );

    // markers
    legend.markers.template.setAll({
      width: 14,
      height: 14,
    });

    // Set max width and wrapping
    legend.labels.template.setAll({
      maxWidth: 120,
      oversizedBehavior: 'wrap',
      fontSize: 13,
      fill: am5.color(0xffffff),
    });

    // Makes labels to be right-aligned
    legend.valueLabels.template.setAll({
      width: 70,
      textAlign: 'right',
      fontSize: 13,
      fill: am5.color(0xffffff),
    });

    function makeSeries(name, fieldName) {
      let series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: fieldName,
          valueYShow: 'valueYTotalPercent',
          categoryXField: 'label',
          stroke: '#25232A',
        }),
      );

      series.columns.template.setAll({
        width: am5.percent(40),
      });

      let tooltip = series.set(
        'tooltip',
        am5.Tooltip.new(root, {
          getFillFromSprite: true,
          autoTextColor: true,
        }),
      );

      // 툴팁박스 들어갈 내용
      tooltip.label.set(
        'text',
        `[fontSize: 13px]{name}: {valueYTotalPercent.formatNumber('#.#')}%[/]`,
      );
      tooltip.label.setAll({
        fill: '#c2c2c2',
      });

      // 툴팁박스 배경색
      tooltip.get('background').setAll({
        stroke: '#423f4a',
      });

      series.data.setAll(data);

      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            fill: root.interfaceColors.get('alternativeText'),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true,
          }),
        });
      });

      legend.data.push(series);
    }

    valueKeys.forEach((value) => {
      makeSeries(value, value);
    });

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
      cornerRadiusTR: 0,
      cornerRadiusBR: 0,
      cornerRadiusTL: 0,
      cornerRadiusBL: 0,
    });

    scrollbarX.startGrip.get('background').setAll({
      stroke: '#c2c2c2',
      strokeWidth: 2,
      draw: function (display) {
        display.drawRect(-5, 9, 40, 12);
      },
    });

    scrollbarX.endGrip.get('background').setAll({
      stroke: '#c2c2c2',
      strokeWidth: 2,
      draw: function (display) {
        display.drawRect(-5, 9, 40, 12);
      },
    });

    chart.set('scrollbarX', scrollbarX);
    chart.bottomAxesContainer.children.push(scrollbarX);

    chart.appear(1000, 100);
  }, [data, labelRotation, tagId]);

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

export default StackedColumnChart;
