import { useEffect, useCallback } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';

// Components
import EmptyBox from '@src/components/molecules/EmptyBox';

am4core.useTheme(am4themesAnimated);
const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

let chart;
const TimeSeriesChart = ({
  tagId,
  data = [],
  dateX = 'date',
  valueY = 'usage',
  customStyle = {},
  tooltipText = "{dateX} : {valueY.value.formatNumber('#.##')}%",
  maxValue,
}) => {
  const generateChart = useCallback(() => {
    if (!document.getElementById(tagId) || data.length === 0) return;
    chart = am4core.create(tagId, am4charts.XYChart);

    for (const element of data) {
      const dateTime = new Date(element.date);
      const krDateTime = new Date(dateTime.getTime() + KR_TIME_DIFF);
      element.date = krDateTime;
    }

    chart.data = data.reverse();

    const DateAxis = chart.xAxes.push(new am4charts.DateAxis());
    DateAxis.renderer.grid.template.location = 0;
    DateAxis.renderer.ticks.template.disabled = true;
    DateAxis.renderer.line.opacity = 0;
    DateAxis.renderer.grid.template.disabled = true;
    // DateAxis.renderer.minGridDistance = 40;
    // DateAxis.dataFields.category = 'date';
    DateAxis.startLocation = 0.4;
    DateAxis.endLocation = 0.6;
    DateAxis.fontSize = '12px';
    DateAxis.dateFormats.setKey('minute', 'YYYY-MM-dd HH:mm');

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.line.opacity = 0;
    valueAxis.renderer.ticks.template.disabled = true;
    valueAxis.min = -5;
    if (maxValue) valueAxis.max = maxValue + 5;
    valueAxis.strictMinMax = true;
    valueAxis.fontSize = '12px';

    const lineSeries = chart.series.push(new am4charts.LineSeries());
    lineSeries.dataFields.dateX = dateX;
    lineSeries.dataFields.valueY = valueY;
    lineSeries.tooltipText = tooltipText;
    lineSeries.tooltip.getFillFromObject = false;
    lineSeries.tooltip.background.fill = am4core.color('#ffffff');
    lineSeries.tooltip.label.fill = am4core.color('#000');
    lineSeries.fill = am4core.color('#2d76f8');
    lineSeries.fillOpacity = 0.1;
    lineSeries.stroke = am4core.color('#779eff');
    lineSeries.strokeOpacity = 1;
    lineSeries.strokeWidth = 3;
    lineSeries.propertyFields.stroke = am4core.color('#779eff');
    lineSeries.propertyFields.fill = 'fillColor';

    const bullet = lineSeries.bullets.push(new am4charts.CircleBullet());
    bullet.circle.radius = 6;
    bullet.circle.fill = am4core.color('#ffffff');
    bullet.circle.stroke = am4core.color('#2d76f8');
    bullet.circle.strokeWidth = 3;

    const { zoomOutButton } = chart;
    zoomOutButton.align = 'right';
    zoomOutButton.valign = 'bottom';
    zoomOutButton.marginBottom = 11;
    zoomOutButton.width = 32;
    zoomOutButton.height = 32;
    zoomOutButton.background.cornerRadius(4, 4, 4, 4);
    zoomOutButton.background.fill = am4core.color('#f0f0f0');
    zoomOutButton.icon.stroke = am4core.color('#747474');
    zoomOutButton.icon.strokeWidth = 2;
    zoomOutButton.icon.align = 'center';
    zoomOutButton.icon.valign = 'middle';
    zoomOutButton.background.states.getKey('hover').properties.fill =
      am4core.color('#dbdbdb');

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = 'panX';
    chart.cursor.lineX.opacity = 0;
    chart.cursor.lineY.opacity = 0;

    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX.parent = chart.bottomAxesContainer;
    chart.scrollbarX.background.fill = am4core.color('#dbdbdb');
    chart.scrollbarX.thumb.background.fill = am4core.color('#2d76f8');
    chart.scrollbarX.thumb.background.states.getKey('hover').properties.fill =
      am4core.color('#2d76f8');
    chart.scrollbarX.thumb.height = 8;

    function customizeGrip(customGrip) {
      const grip = customGrip;
      grip.width = 20;
      grip.height = 20;
      grip.background.fill = am4core.color('#ffffff');
      grip.background.fillOpacity = 1;
      grip.background.states.getKey('hover').properties.fill =
        am4core.color('#ffffff');
      grip.icon.disabled = true;
      const shadow = new am4core.DropShadowFilter();
      shadow.dx = 1;
      shadow.dy = 2;
      shadow.blur = 6;
      shadow.color = am4core.color('rgba(0, 0, 0, 0.3)');
      grip.filters.push(shadow);
    }

    customizeGrip(chart.scrollbarX.startGrip);
    customizeGrip(chart.scrollbarX.endGrip);
  }, [data, tagId, dateX, maxValue, tooltipText, valueY]);

  useEffect(() => {
    generateChart();
    return () => {
      if (chart) chart.dispose();
    };
  }, [generateChart, data]);
  return (
    <>
      {data.length === 0 ? (
        <EmptyBox customStyle={customStyle} text={'noChartData.message'} />
      ) : (
        <div id={tagId} style={customStyle}></div>
      )}
    </>
  );
};

export default TimeSeriesChart;
