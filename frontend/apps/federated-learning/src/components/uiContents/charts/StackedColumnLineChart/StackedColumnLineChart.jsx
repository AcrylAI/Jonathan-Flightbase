import { useEffect, useCallback } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

let chart;
let root;
const StackedColumnLineChart = ({
  tagId,
  data = [],
  customStyle = {},
  labelRotation = 0,
  showLineChart = true,
}) => {
  const generateChart = useCallback(() => {
    if (!document.getElementById(tagId) || data.length === 0) return;

    let chartData = data.slice(0, 200);

    const valueKeys = Object.keys(chartData[0]);

    for (let i = 0; i < valueKeys.length; i++) {
      if (
        valueKeys[i] === 'id' ||
        valueKeys[i] === 'target' ||
        valueKeys[i] === 'idx'
      ) {
        valueKeys.splice(i, 1);
        i--;
      }
    }

    root = am5.Root.new(tagId);
    root.setThemes([am5themes_Animated.new(root)]);

    let indicator = root.container.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: am5.p100,
        layer: 1000,
        background: am5.Rectangle.new(root, {
          fill: '#fff',
          fillOpacity: 0.7,
        }),
      }),
    );

    indicator.children.push(
      am5.Label.new(root, {
        text: 'Loading...',
        fontSize: 24,
        x: am5.p50,
        y: am5.p50,
        centerX: am5.p50,
        centerY: am5.p50,
        fill: '#c2c2c2',
      }),
    );

    function toggleIndicator() {
      if (indicator.isHidden()) {
        indicator.show();
      } else {
        indicator.hide();
      }
    }

    toggleIndicator();

    chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
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
      centerX: am5.p50,
      paddingRight: 5,
      fontSize: 12,
      fill: '#fff',
    });

    xRenderer.grid.template.setAll({
      strokeOpacity: 0,
    });

    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'id',
        tooltip: am5.Tooltip.new(root, {}),
        renderer: xRenderer,
        // maxZoomCount: 100,
        minZoomCount: 5,
      }),
    );

    xAxis.data.setAll(chartData);

    let yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.labels.template.setAll({
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 13,
      fontSize: 12,
      fill: '#fff',
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

    let targetAxisRenderer = am5xy.AxisRendererY.new(root, {
      opposite: true,
    });

    let targetAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: targetAxisRenderer,
        strictMinMax: true,
      }),
    );

    targetAxisRenderer.labels.template.setAll({
      centerY: am5.p50,
      centerX: am5.p100,
      paddingLeft: 13,
      fontSize: 12,
      fill: '#fff',
    });

    targetAxisRenderer.grid.template.set('forceHidden', true);

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
      fill: '#fff',
    });

    // Makes labels to be right-aligned
    legend.valueLabels.template.setAll({
      width: 70,
      textAlign: 'right',
      fontSize: 13,
      fill: '#fff',
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
          categoryXField: 'id',
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

      // * 툴팁박스 들어갈 내용
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

      series.data.setAll(chartData);

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

    if (showLineChart) {
      let series2 = chart.series.push(
        am5xy.LineSeries.new(root, {
          xAxis: xAxis,
          yAxis: targetAxis,
          valueYField: 'target',
          sequencedInterpolation: false,
          categoryXField: 'id',
          tooltip: am5.Tooltip.new(root, {
            // labelText: '[fontSize: 13px]{valueY}[/]',
          }),
          stroke: am5.color('#fff'),
          connect: false,
        }),
      );

      series2.strokes.template.setAll({
        strokeWidth: 2,
        opacity: 0.7,
      });

      let tooltip = series2.set(
        'tooltip',
        am5.Tooltip.new(root, {
          getFillFromSprite: false,
          autoTextColor: true,
        }),
      );

      // 툴팁박스 들어갈 내용
      tooltip.label.set('text', `[fontSize: 13px]Target: {valueY}[/]`);
      tooltip.label.setAll({
        fill: '#c2c2c2',
      });

      // 툴팁박스 배경색
      tooltip.get('background').setAll({
        fill: '#fff',
        stroke: '#423f4a',
      });

      series2.data.setAll(chartData);
    }

    // 줌 버튼 컬러
    root.interfaceColors.setAll({
      primaryButton: '#5089f0',
      primaryButtonHover: '#2d76f8',
      primaryButtonDown: '#2d76f8',
      primaryButtonActive: '#2d76f8',
    });

    // 라인차트 스크롤바
    let scrollbarX = am5xy.XYChartScrollbar.new(root, {
      orientation: 'horizontal',
      height: 60,
      scale: 1,
    });

    chart.set('scrollbarX', scrollbarX);
    chart.bottomAxesContainer.children.push(scrollbarX);
    scrollbarX.get('background').setAll({
      fill: '#25232a',
      cornerRadiusTR: 0,
      cornerRadiusBR: 0,
      cornerRadiusTL: 0,
      cornerRadiusBL: 0,
    });

    // scrollbarX.startGrip.get('background').setAll({
    //   stroke: '#c2c2c2',
    //   strokeWidth: 2,
    //   draw: function (display) {
    //     display.drawRect(0, 0, 30, 30);
    //   },
    // });

    // scrollbarX.endGrip.get('background').setAll({
    //   stroke: '#c2c2c2',
    //   strokeWidth: 2,
    //   draw: function (display) {
    //     display.drawRect(0, 0, 30, 30);
    //   },
    // });

    let sbxRenderer = am5xy.AxisRendererX.new(root, {});
    sbxRenderer.labels.template.setAll({
      visible: false,
    });

    let sbxAxis = scrollbarX.chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        strictMinMax: true,
        renderer: sbxRenderer,
      }),
    );

    let sbyAxis = scrollbarX.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    let sbSeries = scrollbarX.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueXField: 'idx',
        valueYField: 'target',
        xAxis: sbxAxis,
        yAxis: sbyAxis,
      }),
    );

    sbSeries.fills.template.setAll({
      visible: true,
      fillOpacity: 0.08,
    });

    sbSeries.data.setAll(chartData);

    chart.appear(1000, 100);
  }, [data, labelRotation, showLineChart, tagId]);

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

export default StackedColumnLineChart;
