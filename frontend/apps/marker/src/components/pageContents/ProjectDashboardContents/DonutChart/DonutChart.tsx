import React, { memo, useEffect, useLayoutEffect } from 'react';
import { useState } from 'react';
import _ from 'lodash';

// Color
import { MONO202, MONO204, MONO206 } from '@src/utils/color';

import type { DataType } from './types';

// am5Chart
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
// eslint-disable-next-line camelcase
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
// eslint-disable-next-line camelcase
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';

type Props = {
  tagId: string;
  data: DataType;
  legendVisible?: boolean;
  thickNess?: 1 | 2 | 3 | 4 | 5;
  seriesColors?: Array<am5.Color>;
  customStyle?: React.CSSProperties;
  legendAlign?: 'right' | 'bottom';
};

function DonutChart({
  tagId,
  data,
  legendVisible = true,
  thickNess,
  seriesColors,
  legendAlign,
  customStyle,
}: Props) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useLayoutEffect(() => {
    if (!document.getElementById(tagId)) return () => {};

    let centerTextSize = 14;
    let centerValueSize = 24;

    if (windowSize.width < 1350) {
      centerTextSize = 8;
      centerValueSize = 16;
    }

    const {
      category,
      value,
      data: chartData,
      totalDataLabel: tDataLabel,
      totalData: tData,
    } = data;

    const noneData = tData === '0';

    const root: am5.Root = am5.Root.new(tagId);
    root.autoResize = false;

    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

    let innerRadius = 50;

    if (thickNess === 1) {
      innerRadius = 80;
    } else if (thickNess === 2) {
      innerRadius = 60;
    } else if (thickNess === 3) {
      innerRadius = 40;
    } else if (thickNess === 4) {
      innerRadius = 20;
    } else if (thickNess === 5) {
      innerRadius = 0;
    }

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.horizontalLayout,
        radius: am5.percent(65),
        innerRadius: am5.percent(innerRadius),
      }),
    );

    const bgColor = root.interfaceColors.get('background');
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: value,
        categoryField: category,
        alignLabels: false,
      }),
    );

    series.labels.template.setAll({
      forceHidden: true,
    });
    series.ticks.template.setAll({
      forceHidden: true,
    });

    series.slices.template.setAll({
      stroke: bgColor,
      strokeWidth: 2,
      tooltipHTML: `
          <div style='height: 16px; font-size: 14px; font-family: MarkerFont; overflow: hidden'>
            {${data.name}}: {valuePercentTotal.formatNumber('0.0')}%
          </div>
        `,
    });
    const totalDataLabel = series.children.push(
      am5.Label.new(root, {
        text: tDataLabel,
        fill: MONO204 as unknown as am5.Color,
        fontSize: centerTextSize,
        fontFamily: 'MarkerFont',
        centerX: am5.percent(50),
        centerY: am5.percent(70),
        y: -10,
        populateText: true,
      }),
    );

    const totalData = series.children.push(
      am5.Label.new(root, {
        text: tData,
        fill: MONO206 as unknown as am5.Color,
        fontSize: centerValueSize,
        centerX: am5.percent(50),
        centerY: am5.percent(10),
        y: -2,
        populateText: true,
      }),
    );

    series.onPrivate(
      'totalDataLabel' as keyof am5percent.IPieSeriesPrivate,
      () => {
        totalDataLabel.text.markDirtyText();
      },
    );

    series.onPrivate('totalData' as keyof am5percent.IPieSeriesPrivate, () => {
      totalData.text.markDirtyText();
    });

    if (seriesColors && seriesColors.length > 0) {
      series.get('colors')?.set('colors', seriesColors);
    }

    if (noneData) {
      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField: value,
          categoryField: category,
          alignLabels: false,
        }),
      );

      series.labels.template.setAll({
        forceHidden: true,
      });
      series.ticks.template.setAll({
        forceHidden: true,
      });
      series.slices.template.setAll({
        stroke: MONO202 as unknown as am5.Color,
        strokeWidth: 2,
        tooltipText: '',
      });
      series.get('colors')?.set('colors', [MONO202 as unknown as am5.Color]);

      series.data.setAll([{ value: 1 }]);
    } else {
      series.slices.template.states.create('active', {
        shiftRadius: 0,
      });
      series.data.setAll(chartData);
    }

    if (legendVisible) {
      let legendX = 60;
      let legendY = 50;

      if (windowSize.width <= 1024) {
        legendX = 52;
      }

      if (legendAlign === 'bottom') {
        legendX = 10;
        legendY = 80;
      }

      let legendDefaultOptions = {
        centerX: am5.percent(10),
        centerY: am5.percent(50),
        x: am5.percent(legendX),
        y: am5.percent(legendY),
        layout: root.verticalLayout,
        clickTarget: 'none' as const,
      };
      const legendScrollbarOptions = {
        height: am5.percent(100),
        verticalScrollbar: am5.Scrollbar.new(root, {
          orientation: 'vertical',
          visible: false,
        }),
      };
      if (chartData.length > 7) {
        legendDefaultOptions = {
          ...legendDefaultOptions,
          ...legendScrollbarOptions,
        };
      }
      const legend = chart.children.push(
        am5.Legend.new(root, legendDefaultOptions),
      );
      // markers
      legend.markers.template.setAll({
        width: 14,
        height: 14,
      });

      legend.labels.template.setAll({
        maxWidth: 120,
        oversizedBehavior: 'wrap',
        fontSize: 12,
        fontFamily: 'MarkerFont',
        fill: am5.color(0x000000),
      });

      legend.valueLabels.template.setAll({
        width: 70,
        textAlign: 'right',
        fontSize: 12,
        fontFamily: 'MarkerFont',
        fill: am5.color(0x000000),
      });
      legend.data.setAll(series.dataItems);
    }

    // series.appear(1000, 100);
    // chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [
    data,
    legendAlign,
    legendVisible,
    seriesColors,
    tagId,
    thickNess,
    windowSize,
  ]);

  const handleResize = _.throttle(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, 100);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id={tagId}
      style={{
        ...customStyle,
        pointerEvents: data.totalData === '0' ? 'none' : 'auto',
      }}
    ></div>
  );
}

DonutChart.defaultProps = {
  thickNess: 1,
  customStyle: {
    width: '100%',
    height: '300px',
  },
  seriesColors: undefined,
  legendVisible: true,
  legendAlign: 'right',
};

export default memo(
  DonutChart,
  (prev, next) => JSON.stringify(prev) === JSON.stringify(next),
);
