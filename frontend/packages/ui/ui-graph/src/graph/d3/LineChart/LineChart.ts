import * as d3 from 'd3';
import {
  LineChartParam,
  LineChartSeriesType,
  UpdateOptionType,
} from './LineChartTypes';

export class LineChart {
  data: any;

  eleId: string;

  width: number;

  height: number;

  legend: boolean;

  scaleType?: string;

  xTickFormat?: any;

  xAxisMaxTicks?: number;

  yAxisMaxTicks?: number;

  tooltip?: any;

  isResponsive?: boolean;

  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };

  series: any;

  xAxis?: d3.Selection<SVGGElement, any, HTMLElement, any>;

  yAxisArr: any[];

  xScale?: any;

  legendEle?: any;

  chart?: d3.Selection<SVGCircleElement, any, HTMLElement, any>;

  chartSvg?: any;

  tooltipLine?: any;

  boxForTooltipMove?: any;

  tooltipInfo: any;

  constructor({
    eleId,
    width,
    height,
    isResponsive,
    legend,
    scaleType,
    xTickFormat: _xTickFormat,
    xAxisMaxTicks: _xAxisMaxTicks,
    yAxisMaxTicks: _yAxisMaxTicks,
    tooltip,
  }: Partial<LineChartParam>) {
    this.eleId = eleId || '';

    this.width = width || 950;

    this.height = height || 500;

    this.margin = {
      top: 20,
      right: 40,
      bottom: 50,
      left: 40,
    };

    this.isResponsive = isResponsive || false;

    this.scaleType = scaleType;

    this.xTickFormat = _xTickFormat;

    this.xAxisMaxTicks = _xAxisMaxTicks || 10;

    this.yAxisMaxTicks = _yAxisMaxTicks || 10;

    this.series = [];

    this.xAxis = undefined;

    this.yAxisArr = [];

    this.xScale = undefined;

    this.legendEle = undefined;

    this.chart = undefined;

    this.chartSvg = undefined;

    this.legend = legend || false;

    this.tooltip = tooltip;

    this.tooltipLine = undefined;

    this.boxForTooltipMove = undefined;
  }

  init(data?: any) {
    this.data = data || [];
    const { eleId, width, height } = this;
    const chartBox = document.getElementById(eleId);
    if (chartBox !== null) chartBox.innerHTML = '';

    this.chartSvg = d3
      .select(`#${eleId}`)
      .attr('class', 'chart-container')
      .style('position', 'relative')
      .append('svg');

    if (this.isResponsive && this.chartSvg) {
      this.chart = this.chartSvg
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', [0, 0, width, height])
        .append('g');
    } else {
      this.chart = this.chartSvg.attr('width', width).attr('height', height);
    }

    // 툴팁 init
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('top', '0px')
      .style('left', '0px');

    if (this.chart !== undefined) {
      // 툴팁 라인 init
      this.tooltipLine = this.chart.append('line');

      // 툴팁을 위한 마우스 오버 이벤트 박스
      this.boxForTooltipMove = this.chart.append('rect');
    }
  }

  updateOption({
    width,
    height,
    isResponsive,
    legend,
    xTickFormat,
    xAxisMaxTicks,
  }: UpdateOptionType) {
    if (width) this.width = width;
    if (height) this.height = height;
    if (xTickFormat) this.xTickFormat = xTickFormat;
    if (xAxisMaxTicks) this.xAxisMaxTicks = xAxisMaxTicks;

    if (width !== undefined || height !== undefined) {
      this.chartSvg.attr('viewBox', [0, 0, this.width, this.height]);
    }
    if (isResponsive !== undefined && isResponsive !== this.isResponsive) {
      this.isResponsive = isResponsive;
      if (this.isResponsive) {
        this.chartSvg.attr('width', null);
        this.chartSvg.attr('height', null);
        this.chartSvg
          .attr('preserveAspectRatio', 'xMinYMin meet')
          .attr('viewBox', [0, 0, this.width, this.height]);
      } else {
        this.chartSvg.attr('preserveAspectRatio', null);
        this.chartSvg.attr('viewBox', null);
        this.chartSvg.attr('width', this.width).attr('height', this.height);
      }
    }
    if (legend !== undefined && legend !== this.legend) {
      this.legend = legend;
    }
  }

  addSeries(item: any) {
    if (this.chart) {
      const dot = this.chart
        .append('circle')
        .attr('r', 3)
        .attr('fill', item.color)
        .style('display', 'none');

      const path = this.chart.append('path');
      this.series.push({
        ...item,
        dot,
        path,
      });
    }
  }

  setSeries(seriesArr: LineChartSeriesType[]) {
    const { series, data, height } = this;
    for (let i = 0; i < this.yAxisArr.length; i += 1) {
      const yAxis = this.yAxisArr[i];
      yAxis.remove();
      // if (!seriesArr[i]) {
      // yAxis.remove();
      // }
    }
    this.yAxisArr = [];
    // this.yAxisArr = this.yAxisArr.slice(0, seriesArr.length);

    for (let i = 0; i < series.length; i += 1) {
      const { dot, path } = series[i];
      dot.remove();
      path.remove();
    }

    this.series = seriesArr.map((item: LineChartSeriesType) => {
      let dot;
      let path;
      let yScale;

      if (this.chart) {
        dot = this.chart
          .append('circle')
          .attr('r', 3)
          .attr('fill', item.color)
          .style('display', 'none');

        path = this.chart.append('path');
      }
      if (data) {
        const domain = d3.extent(data, (d: any) => {
          return Number(d[item.x]);
        });
        if (domain[0] !== undefined && domain[1] !== undefined) {
          yScale = d3.scaleLinear().domain(domain).range([height, 0]);
        } else {
          yScale = d3.scaleLinear().domain([0, 0]).range([height, 0]);
        }
      }

      return {
        ...item,
        dot,
        path,
        yScale,
      };
    });
  }

  draw() {
    const { series, margin } = this;
    const { w, h, leftXPos, xTarget } = this.getChartAreaInfo(series);
    // 그래프 영역 위치 조정
    if (this.chart) {
      this.chart.attr('transform', `translate(${leftXPos}, ${margin?.top})`);
    }

    // x축 렌더링
    this.renderXAxis(this.data, w, h, xTarget);

    // path, y축 렌더링
    this.renderYAxisAndPath(series, this.data, h);

    // 레전드 렌더링
    if (this.legend) {
      this.renderLegend(d3.select(`#${this.eleId}`), series);
    } else {
      const legendEle = d3.selectAll('.legend-wrap');
      legendEle.remove();
      this.legendEle = undefined;
    }

    // 툴팁 렌더링
    this.renderTooltip(w, h, xTarget);
  }

  // x축 렌더링
  renderXAxis(d: any, w: any, h: any, xTarget: any) {
    const { scaleType } = this;

    if (scaleType === 'date') {
      const domain = d3.extent(d, (data: any) => Number(data[xTarget]));
      if (domain[0] !== undefined && domain[1] !== undefined) {
        this.xScale = d3.scaleTime().domain(domain).range([0, w]);
      } else {
        this.xScale = d3.scaleTime().domain([0, 0]).range([0, w]);
      }
    } else {
      const domain = d3.extent(d, (data: any) => Number(data[xTarget]));
      if (domain[0] !== undefined && domain[1] !== undefined) {
        this.xScale = d3.scaleLinear().domain(domain).range([0, w]);
      } else {
        this.xScale = d3.scaleLinear().domain([0, 0]).range([0, w]);
      }
    }
    if (!this.xAxis && this.chart) {
      this.xAxis = this.chart
        .append('g')
        .attr('class', 'xaxis')
        .attr('transform', `translate(0, ${h})`)
        .style('color', '#3e3e3e')
        .call(
          d3
            .axisBottom(this.xScale)
            .ticks(this.getTick(d))
            .tickFormat((v) => {
              if (this.xTickFormat) return this.xTickFormat(v);
              return v;
            }),
        );
    } else if (this.xAxis) {
      const xAxisCall = d3
        .axisBottom(this.xScale)
        .ticks(this.getTick(d))
        .tickFormat((v) => {
          if (this.xTickFormat) return this.xTickFormat(v);
          return v;
        });

      this.xAxis
        .attr('transform', `translate(0, ${h})`)
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .call(xAxisCall);
    }
  }

  // Y축 및 라인 렌더링
  renderYAxisAndPath(series: any, d: any, h: any) {
    const { yAxisArr, width, margin, data } = this;
    let leftX = 0;
    let rightX = 0;
    this.series = series.map((sVal: any, i: number) => {
      const { y, align, color, domain = [] } = sVal;
      // Add Y axis
      const yAxis = yAxisArr[i];

      const [min, max] = domain;
      const dataMax = d3.max(d, (item: any) => item[y]);

      const scaleDomain = [
        min !== undefined && min < 0 ? min : 0,
        max !== undefined && dataMax !== undefined && max > dataMax
          ? max
          : dataMax,
      ];
      const yScale = d3.scaleLinear().domain(scaleDomain).range([h, 0]);
      if (align === 'LEFT') {
        leftX = margin?.left ? margin?.left * i * -1 : i * -1;
        this.renderYAxis(yAxis, leftX, align, yScale, color);
      } else {
        rightX = margin?.right
          ? width - margin.right * (i + 1)
          : width * (i + 1);
        this.renderYAxis(yAxis, rightX, align, yScale, color);
      }
      this.renderPath(series[i], yScale, data);
      return { ...sVal, yScale };
    });
  }

  // y축 렌더링
  renderYAxis(yAxis: any, xPos: any, align: any, yScale: any, color: string) {
    const { yAxisArr } = this;
    if (!yAxis && this.chart) {
      const axis = this.chart
        .append('g')
        .attr('class', `yaxis ${align}`)
        .attr('transform', `translate(${xPos}, 0)`)
        .call(align === 'LEFT' ? d3.axisLeft(yScale) : d3.axisRight(yScale))
        .call((tmpG: any) => tmpG.select('.domain').style('display', 'none'));
      yAxisArr.push(axis);
      axis.selectAll('text').style('fill', color);
      axis.selectAll('line').style('stroke', color);
    } else if (yAxis) {
      yAxis
        .attr('class', `yaxis ${align}`)
        .attr('transform', `translate(${xPos}, 0)`)
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .call(align === 'LEFT' ? d3.axisLeft(yScale) : d3.axisRight(yScale));

      yAxis.selectAll('text').style('fill', color);

      yAxis.selectAll('line').style('stroke', color);
    }
  }

  renderPath(s: any, yScale: any, data: any) {
    const { x, y, color, path } = s;
    // 7. d3's line generator
    if (this.xScale !== undefined) {
      const line = d3
        .line()
        // .curve(d3.curveBasis)
        .x((d) => this.xScale(d[x])) // set the x values for the line generator
        .y((d) => yScale(d[y])); // set the y values for the line generator
      // .curve(d3.curveMonotoneX) // apply smoothing to the line
      if (path !== undefined) {
        path
          .datum(data) // 10. Binds data to the line
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 1)
          // .attr('stroke-linejoin', 'round')
          // .attr('stroke-linecap', 'round')
          .attr('class', 'line') // Assign a class for styling
          .attr('d', line); // 11. Calls the line generator
      }
    }
  }

  // 레전드 렌더링
  renderLegend = (ele: any, series: any) => {
    if (!this.legendEle) {
      this.legendEle = ele
        .append('div')
        .attr('class', 'legend-wrap')
        .style('position', 'absolute')
        .style('bottom', '20px')
        .style('left', '50%')
        .style('transform', 'translateX(-50%)')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .append('ul')
        .attr('class', 'legend')
        .style('display', 'flex')
        .style('margin', 0)
        .style('padding', 0);
    }
    this.legendEle
      .selectAll('li')
      .data(series)
      .join('li')
      .style('margin-right', '10px')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('font-size', '12px')
      .style('white-space', 'nowrap')
      .html(
        (d: LineChartSeriesType) =>
          `<span class='bullet' style='background-color: ${
            d.color
          };display: inline-block;width:6px;height:6px;border-radius:3px;margin-right: 4px;'></span><span>${
            d.label || d.y
          }</span>`,
      );
  };

  // 그래프 영역 정보 가져오기
  getChartAreaInfo(series: any) {
    const { width, margin } = this;
    let leftAxisCount = 0;
    let rightAxisCount = 0;
    let xTarget;
    for (let i = 0; i < series.length; i += 1) {
      const { align, x } = series[i];
      if (x) xTarget = x;
      if (align === 'RIGHT') {
        rightAxisCount += 1;
      } else {
        leftAxisCount += 1;
      }
    }
    leftAxisCount = Math.max(leftAxisCount, 1);
    rightAxisCount = Math.max(rightAxisCount, 1);
    const leftXPos = margin?.left ? margin.left * leftAxisCount : leftAxisCount;
    const rightXPos = margin?.right
      ? margin.right * rightAxisCount
      : rightAxisCount;
    return {
      w: width - leftXPos - rightXPos,
      h: this.getViewHeight(),
      leftXPos,
      rightXPos,
      xTarget,
    };
  }

  // 툴팁 렌더링
  renderTooltip(w: number, h: number, xTarget: any) {
    this.boxForTooltipMove
      .raise()
      .attr('width', w + 10)
      .attr('height', h)
      .attr('fill-opacity', 0)
      .attr('class', 'zoom')
      .on('mousemove', () => {
        this.drawTooltip(w, h, xTarget);
      });
  }

  drawTooltip = (w: number, h: number, xTarget: any) => {
    const { series, data, tooltipInfo, xTickFormat } = this;

    // return;
    const bisect = d3.bisector((d: any) => d[xTarget]).left;

    const mousemoveEvent = (e: MouseEvent) => {
      const mouse = d3.pointer(e, this.boxForTooltipMove.node());

      const [xPos] = mouse;
      const xVal: number = Math.round(this.xScale.invert(xPos));

      const i = bisect(data, xVal);

      const targetData = data[i];
      if (targetData === undefined) return;
      for (let idx = 0; idx < series.length; idx += 1) {
        const { x, y, yScale, dot } = series[idx];
        const dotX = this.xScale(targetData[x]);
        const dotY = yScale(targetData[y]);
        dot
          .style('display', 'block')
          .transition()
          .duration(100)
          .ease(d3.easeLinear)
          .attr('transform', `translate(${dotX},${dotY})`);

        if (this.tooltipLine !== undefined) {
          this.tooltipLine
            .attr('stroke', '#3e3e3e')
            .style('stroke-dasharray', '3, 3')
            .transition()
            .duration(100)
            .ease(d3.easeLinear)
            .attr('x1', dotX)
            .attr('x2', dotX)
            .attr('y1', 0)
            .attr('y2', h);
        }
      }

      const top = e.pageY - 20;
      let left = e.pageX + 20;
      if (tooltipInfo && tooltipInfo.align && tooltipInfo.align === 'right') {
        left = e.clientX - 200;
      }
      const tooltipWidth = 160;
      const overWindow = window.innerWidth - (tooltipWidth + 40);
      if (left > overWindow) left -= tooltipWidth + 60;

      this.tooltip
        .html(xTickFormat ? xTickFormat(xVal) : xVal)
        .style('display', 'block')
        .style('width', `${tooltipWidth}px`)
        .style('min-width', 'fit-content')
        .style('border', '1px solid #ccc')
        .style('padding', '10px')
        .style('background', '#ffffff')
        .style('top', `${top}px`)
        .style('left', `${left}px`)
        .selectAll('div')
        .data(series)
        .join('div')
        .html(({ y, label }: any) => `${label || y} : ${targetData[y]}`)
        .style('font-size', '11px')
        .style('margin-bottom', '4px')
        .style('color', (d: any) => d.color);
    };

    const removeTooltip = () => {
      const { tooltip, tooltipLine, series } = this;
      if (tooltip) tooltip.style('display', 'none');
      if (tooltipLine) tooltipLine.attr('stroke', 'none');
      if (series) {
        for (let i = 0; i < series.length; i += 1) {
          const { dot } = series[i];
          dot.style('display', 'none');
        }
      }
    };

    this.boxForTooltipMove
      .on('mousemove', mousemoveEvent)
      .on('mouseout', removeTooltip);
  };

  getViewWidth(): number {
    if (this.margin?.left && this.margin?.right) {
      return this.width - this.margin.left - this.margin.right;
    }
    if (this.margin?.left && !this.margin.right) {
      return this.width - this.margin.left;
    }
    if (!this.margin?.left && this.margin?.right) {
      return this.width - this.margin.right;
    }
    return this.width;
  }

  getViewHeight(): number {
    if (this.margin?.top && this.margin.bottom) {
      return this.height - this.margin.top - this.margin.bottom;
    }

    if (this.margin?.top && !this.margin?.bottom) {
      return this.height - this.margin.top;
    }

    if (!this.margin?.top && this.margin?.bottom) {
      return this.height - this.margin.bottom;
    }

    return this.height;
  }

  getTick(data: any) {
    const { xAxisMaxTicks } = this;
    const dataLength = data.length;
    if (xAxisMaxTicks) {
      return dataLength < xAxisMaxTicks ? dataLength : xAxisMaxTicks;
    }
    return dataLength;
  }
}

export default LineChart;
