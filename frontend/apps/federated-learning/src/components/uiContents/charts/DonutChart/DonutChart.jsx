import { useEffect, useCallback } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';

// i18n
import { useTranslation } from 'react-i18next';

// Utils
import { numberWithCommas } from '@src/utils/utils';

let chart;
let root;
const PieChart = ({ tagId, data = [], total, customStyle = {} }) => {
  const { t } = useTranslation();

  const generateChart = useCallback(() => {
    if (!document.getElementById(tagId) || data.length === 0) return;

    root = am5.Root.new(tagId);
    chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        radius: am5.percent(90),
        innerRadius: am5.percent(50),
        layout: root.horizontalLayout,
      }),
    );

    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: 'Trained Data by Client',
        categoryField: 'label',
        valueField: 'count',
      }),
    );

    // color
    series
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

    series.labels.template.set('visible', false);
    series.ticks.template.set('visible', false);
    series.slices.template.setAll({
      stroke: '#25232A',
      strokeWidth: 2,
      tooltipText: `[fontSize: 13px]{category}: {valuePercentTotal.formatNumber('0.00')}% ({value})[/]`,
    });

    let tooltip = series.set(
      'tooltip',
      am5.Tooltip.new(root, {
        getFillFromSprite: true,
        autoTextColor: true,
      }),
    );

    tooltip.label.setAll({
      fill: '#c2c2c2',
    });

    // 툴팁박스 배경색
    tooltip.get('background').setAll({
      stroke: '#423f4a',
    });

    series.data.setAll(data);

    let totalDataLabel = series.children.push(
      am5.Label.new(root, {
        text: t('roundDetail.totalData.label'),
        fill: '#C2C2C2',
        fontSize: 12,
        centerX: am5.percent(50),
        centerY: am5.percent(70),
        populateText: true,
      }),
    );

    let totalData = series.children.push(
      am5.Label.new(root, {
        text: `${numberWithCommas(total)}`,
        fill: '#FFFFFF',
        fontSize: 14,
        centerX: am5.percent(50),
        centerY: am5.percent(10),
        populateText: true,
      }),
    );

    series.onPrivate('totalDataLabel', () => {
      totalDataLabel.text.markDirtyText();
    });

    series.onPrivate('totalData', () => {
      totalData.text.markDirtyText();
    });

    // legend
    let legendDefaultOptions = {
      centerY: am5.percent(50),
      y: am5.percent(50),
      layout: root.verticalLayout,
      clickTarget: 'none',
    };

    const legendScrollbarOptions = {
      height: am5.percent(95),
      verticalScrollbar: am5.Scrollbar.new(root, {
        orientation: 'vertical',
        // width: 1,
        visible: false,
      }),
    };

    // data 개수가 10개 이상일 때 스크롤바 생성 옵션 추가
    if (data.length > 10) {
      legendDefaultOptions = {
        ...legendDefaultOptions,
        ...legendScrollbarOptions,
      };
    }

    let legend = chart.children.push(
      am5.Legend.new(root, legendDefaultOptions),
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

    legend.data.setAll(series.dataItems);

    series.appear(1000, 100);
    chart.appear(1000, 100);
  }, [data, t, tagId, total]);

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

export default PieChart;
