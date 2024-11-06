import { useLayoutEffect } from 'react';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import emptyMetric from '@images/icon/ic-empty-metric.svg';

// i18n
import { useTranslation } from 'react-i18next';

// CSS module
import style from './ModelMetric.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

function ModelMetric({ metricData }) {
  const { t } = useTranslation();

  useLayoutEffect(() => {
    if (metricData && metricData?.round_data?.length > 0) {
      const minRange = Number(metricData?.min_data);
      const maxRange = Number(metricData?.max_data);

      const metricDatas = [];
      metricData?.round_data?.forEach((data) => {
        const round = Number(data?.round?.round_name);
        const metric = Number(data?.metric);
        const date = data?.create_datetime;
        metricDatas.push({ round, metric, date });
      });

      const divisionFunc = (num) => {
        if (num % 20 === 0) {
          return true;
        } else {
          return false;
        }
      };

      /**
       *
       * @param {Number} num  100 이상 체크
       * @returns
       */
      const moreThanHundredCheck = (num) => {
        if (num > 100) {
          let floorNum = Math.floor(num);
          floorNum = floorNum + 1;
          const valid = divisionFunc(floorNum);

          if (valid) {
            return floorNum;
          } else {
            return moreThanHundredCheck(floorNum);
          }
        } else {
          return 100;
        }
      };

      let yMaxNum = metricData?.latest_metric;
      if (yMaxNum > 80) {
        yMaxNum = moreThanHundredCheck(yMaxNum);
      }

      let root = am5.Root.new('chartdiv');
      root.setThemes([am5themes_Animated.new(root)]);

      // Create chart
      let chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          focusable: false,
          panX: 'none',
          panY: 'none',
          wheelX: 'zoomX',
          // wheelY: 'zoomX', // zoomX ||  panX
          //pinchZoomX: false,
        }),
      );

      // x축을 number로 설정하는 코드
      let xAxis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
          min: minRange,
          max: maxRange,
          strictMinMax: true,
          maxPrecision: 0,
          // 절대적으로 min max에 설정한 값대로 범위 지정(min max 설정 줘도 폭 등에 따라서 보여지는 값이 달라짐)
          numberFormat: '#.',
          renderer: am5xy.AxisRendererX.new(root, {}),
        }),
      );

      let yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          maxDeviation: 0.2,
          max: yMaxNum,
          maxPrecision: 0,
          renderer: am5xy.AxisRendererY.new(root, {
            // y축 맨왼쪽 라인 안 보이게 (배경색과 같게)
            stroke: '#25232a',
          }),
        }),
      );
      yAxis.axisHeader.children.push(
        am5.Label.new(root, {
          text: `${t('dashboard.completedRounds.label')}`,
          fontWeight: '400',
          fontSize: '13px',
          opacity: 0.9,
          y: 265,
          centerY: 20,
          textAlign: 'center',
          x: am5.percent(50),
          centerX: am5.percent(50),
          fill: '#c2c2c2',
        }),
      );
      yAxis.axisHeader.get('background').setAll({
        opacity: 0,
      });

      // Add series
      let series = chart.series.push(
        am5xy.LineSeries.new(root, {
          minBulletDistance: 100,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: 'metric', //'value', //  y축 값 지정
          valueXField: 'round', //'date', // x축 값 지정
          fill: 'rgba(45, 118, 248, 0.15)', // 그래프 배경색
          stroke: '#2d76f8',
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: 'horizontal',
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

      // * 툴팁박스 들어갈 내용
      tooltip.label.set(
        'text',
        ` [width: 60px, fontSize: 13px]${t(
          'round.label',
        )}[#ffffff, fontSize: 13px]#{round} \n[/] [width: 60px, fontSize: 13px]${t(
          'metric.label',
        )}[#ffffff, fontSize: 13px]{metric} \n[/] [width: 60px, fontSize: 13px]${t(
          'date.label',
        )}[#ffffff, fontSize: 13px]{date} `,
      );
      tooltip.label.setAll({
        fill: '#c2c2c2',
      });

      // 툴팁박스 배경색
      tooltip.get('background').setAll({
        fill: '#423f4a',
        fillOpacity: 0.6,
        stroke: '#423f4a',
      });

      series.fills.template.setAll({
        fillOpacity: 0.2,
        visible: true,
      });

      series.strokes.template.setAll({
        strokeWidth: 3,
      });

      // Set up data processor to parse string dates
      series.data.processor = am5.DataProcessor.new(root, {
        numericFields: ['round'],
      });
      // Craete Y-axis

      series.data.setAll(metricDatas);
      series.bullets.push(function () {
        let circle = am5.Circle.new(root, {
          // 포커스 할때 나오는 점 커스텀
          radius: 4,
          fill: '#ffffff',
          stroke: '#2d76f8',
          strokeWidth: 2,
        });

        return am5.Bullet.new(root, {
          sprite: circle,
        });
      });

      // Add cursor
      let cursor = chart.set(
        'cursor',
        am5xy.XYCursor.new(root, {
          xAxis: xAxis,
          behavior: 'zoomX', // 그래프 드래그시 확대됨
        }),
      );
      cursor.lineY.set('visible', false);

      // 줌 버튼 컬러
      root.interfaceColors.setAll({
        primaryButton: '#5089f0',
        primaryButtonHover: '#2d76f8',
        primaryButtonDown: '#2d76f8',
        primaryButtonActive: '#2d76f8',
      });

      chart.zoomOutButton.set('forceHidden', true);

      // add scrollbar
      chart.set(
        'scrollbarX',
        am5.Scrollbar.new(root, {
          orientation: 'horizontal',
          marginTop: 27,
        }),
      );
      cursor.lineX.setAll({
        stroke: '#c2c2c2',
      });

      let scrollbarX = chart.get('scrollbarX');

      scrollbarX.get('background').setAll({
        active: false,
        fill: '#53505b',
        marginTop: 20,
        hoverable: false,
        isHover: false,
        cornerRadiusTR: 0,
        cornerRadiusBR: 0,
        cornerRadiusTL: 0,
        cornerRadiusBL: 0,
      });

      scrollbarX.startGrip.get('icon').setAll({
        fill: 'blue',
        active: false,
        disabled: false,
        forceInactive: false,
        interactive: false,
        cursorOverStyle: 'false',
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

      // 스크롤바 위치
      chart.set('scrollbarX', scrollbarX);
      chart.bottomAxesContainer.children.push(scrollbarX);

      // x 색
      xAxis.get('renderer').labels.template.setAll({
        fill: '#c2c2c2',
      });

      // y 색
      yAxis.get('renderer').labels.template.setAll({
        fill: '#c2c2c2',
      });
      root.interfaceColors.set('grid', 'rgba(95, 95, 95, 0.4)'); // 배경 라인 색상
      // root.interfaceColors.setAll({ grid: 'rgba(95, 95, 95, 0.5)' }); //배경 막대기

      let xRenderer = xAxis.get('renderer');
      // y축 라인 배경색(가장 왼쪽 제외) 안보이게
      xRenderer.grid.template.setAll({
        stroke: '#25232a',
      });

      // x축 눈금자 생성
      // xRenderer.ticks.template.setAll({
      //   stroke: am5.color(0xff0000),
      //   visible: true,
      // });

      // 폰트 사이즈
      // let myTheme = am5.Theme.new(root);
      // myTheme.rule('Label').setAll({
      //   fontSize: '1.5em',
      // });
      // root.setThemes([am5themes_Animated.new(root), myTheme]);

      chart.series.push(
        am5xy.LineSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: 'metric',
          valueXField: 'round',
          locationX: Number(minRange), // x 축 시작 위치
        }),
      );

      // Make stuff animate on load
      chart.appear(1000, 100);

      return () => {
        root.dispose();
      };
    }
  }, [metricData, t]);

  return (
    <>
      {!metricData ? ( // 데이터 null일 때
        ''
      ) : metricData?.round_data?.length > 0 ? ( // 데이터 있을 때
        <div
          id={'chartdiv'}
          style={{
            width: '100%',
            height: '305px',
            position: 'absolute',
            marginBottom: '3px',
          }}
        ></div>
      ) : (
        // 데이터가 없을 때
        <div className={cx('empty-metric')}>
          <img
            src={emptyMetric}
            alt=''
            style={{
              width: '110px',
              height: '60px',
            }}
          />
          <div className={cx('message')}>
            {t('dashboard.noMetricFoundInTheRange')}
          </div>
          <div id={'chartdiv'} style={{ display: 'none' }}></div>
        </div>
      )}
    </>
  );
}

export default ModelMetric;
