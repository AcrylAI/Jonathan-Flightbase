import AxisTypeChart from '../AxisTypeChart';
import * as AxisChartType from '../AxisTypeChartTypes';
import * as LineChartType from './LineChartTypes';

class LineChart extends AxisTypeChart {
  private pointRadius: number;

  constructor({
    nodeId,
    width,
    height,
    point,
    font,
    fontHeight,
    canvasStyle,
  }: LineChartType.LineChartParam) {
    super({
      nodeId,
      width: width || 1800,
      height: height || 700,
      font,
      fontHeight,
      canvasLayer: [
        {
          type: 'main',
          id: 'data-graph',
          canvasStyle: canvasStyle || {},
        },
        {
          type: 'animation',
          id: 'guide-line',
          canvasStyle: {},
        },
      ],
    });

    this.pointRadius = point || this.defaultValue.pointRadius;
  }

  /**
   * Left축에 종속된 데이터(series) draw
   */
  private drawLeftLine() {
    const {
      canvasLayer,
      mainChartIdx,
      series,
      scale,
      axis,
      range,
      startPoint,
      height,
      defaultValue,
      pointRadius,
    } = this;
    const { ctx } = canvasLayer[mainChartIdx];
    if (ctx === null || series === null || axis === null) return;
    const { left } = series;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    left.forEach((s: AxisChartType.SeriesType) => {
      const { color, lineWidth, series: datas } = s;
      ctx.strokeStyle = color || defaultValue.color;
      ctx.fillStyle = color || defaultValue.color;
      ctx.lineWidth = lineWidth || defaultValue.lineWidth;
      ctx.beginPath();
      ctx.moveTo(startPoint.left.x, startPoint.left.y);
      for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        const xPoint = i * scale + startPoint.left.x;
        const yPoint = Math.floor(
          startPoint.left.y - ((data - axis.left.min) * height) / range.left,
        );
        if (i > 0) {
          ctx.lineTo(xPoint, yPoint);
          ctx.stroke();
        }
        if (pointRadius > 0) {
          ctx.beginPath();
          ctx.arc(xPoint, yPoint, pointRadius, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.closePath();
        }
        ctx.moveTo(xPoint, yPoint);
      }
    });

    ctx.restore();
  }

  /**
   * right축에 종속된 데이터(series) draw
   */
  private drawRightLine() {
    const {
      canvasLayer,
      mainChartIdx,
      series,
      scale,
      axis,
      startPoint,
      height,
      range,
      defaultValue,
      pointRadius,
    } = this;
    const { ctx } = canvasLayer[mainChartIdx];
    if (ctx === null || series === null || axis === null) return;
    const { right } = series;
    if (!right) return;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    right.forEach((s: AxisChartType.SeriesType) => {
      const { color, lineWidth, series } = s;
      ctx.strokeStyle = color || defaultValue.color;
      ctx.fillStyle = color || defaultValue.color;
      ctx.lineWidth = lineWidth || defaultValue.lineWidth;
      ctx.beginPath();
      ctx.moveTo(startPoint.right.x, startPoint.right.y);
      const datas = Array.from(series).reverse();
      for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        const xPoint =
          datas.length === 1
            ? startPoint.right.x - i * scale - this.width
            : startPoint.right.x - i * scale;
        const yPoint = Math.floor(
          startPoint.right.y - ((data - axis.right.min) * height) / range.right,
        );
        if (i > 0) {
          ctx.lineTo(xPoint, yPoint);
          ctx.stroke();
        }
        if (pointRadius > 0) {
          ctx.beginPath();
          ctx.arc(xPoint, yPoint, pointRadius, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.closePath();
        }
        ctx.moveTo(xPoint, yPoint);
      }
      ctx.closePath();
    });

    ctx.restore();
  }

  private draw() {
    this.ctxClear();
    this.calcMax();
    this.calcRelation();
    this.drawAxis();
    this.drawBottomTickAndText();
    this.drawLeftTickAndText();
    this.drawRightTickAndText();
    this.drawLeftLine();
    this.drawRightLine();
  }

  public dataInitialize({ series, axis }: LineChartType.InitializeDataParam) {
    this.appendCanvasNode();

    this.series = {
      left: [],
      right: [],
    };
    series.left.forEach((s: AxisChartType.SeriesParamType, idx: number) => {
      if (this.series !== null)
        this.series.left[idx] = {
          name: s.name,
          series: s.series,
          color: s.color || this.defaultValue.color,
          lineWidth: s.lineWidth || 1,
        };
    });
    series.right?.forEach((s: AxisChartType.SeriesParamType, idx: number) => {
      if (this.series !== null)
        this.series.right[idx] = {
          name: s.name,
          series: s.series,
          color: s.color || this.defaultValue.color,
          lineWidth: s.lineWidth || 1,
        };
    });
    this.axis = {
      left: {
        name: axis.left?.name || '',
        unitsPerTick: axis.left?.unitsPerTick || 1,
        max: axis.left?.max || 0,
        min: axis.left?.min || 0,
        padding: axis.left?.padding || this.defaultValue.padding,
        tickSize: axis.left?.tickSize || 0,
        tickColor: axis.left?.tickColor || this.defaultValue.color,
        lineWidth: axis.left?.lineWidth || 1,
        color: axis.left?.color || this.defaultValue.color,
      },
      bottom: {
        name: axis.bottom.name || '',
        unitsPerTick: axis.bottom.unitsPerTick || 1,
        max: axis.bottom.max || 0,
        min: axis.bottom.min || 0,
        padding: axis.bottom.padding || this.defaultValue.padding,
        tickSize: axis.bottom.tickSize || 0,
        tickColor: axis.bottom.tickColor || this.defaultValue.color,
        lineWidth: axis.bottom.lineWidth || 1,
        color: axis.bottom.color || this.defaultValue.color,
        data: axis.bottom.data || [],
      },
      right: {
        name: axis.right?.name || '',
        unitsPerTick: axis.right?.unitsPerTick || 1,
        max: axis.right?.max || 0,
        min: axis.right?.min || 0,
        padding: axis.right?.padding || this.defaultValue.padding,
        tickSize: axis.right?.tickSize || 0,
        tickColor: axis.right?.tickColor || this.defaultValue.color,
        lineWidth: axis.right?.lineWidth || 1,
        color: axis.right?.color || this.defaultValue.color,
      },
    };
  }

  public render(
    renderOption?: AxisChartType.RenderOption,
  ): (() => void) | null {
    if (this.parentNode === null) return null;
    if (renderOption) {
      this.renderOption = {
        ...this.renderOption,
        ...renderOption,
      };
    }
    if (this.renderOption.legend === true) {
      if (this.axis?.bottom) {
        this.axis.bottom = {
          ...this.axis.bottom,
          padding: 30,
        };
      }
    }
    this.tooltipSetting();
    this.correctionCanvas();
    this.draw();
    this.drawLegend();

    this.addEvents([
      this.canvasResize(() => {
        this.draw();
      }),
      this.drawMouseOver(),
      this.mouseout(),
    ]);

    return () => {
      this.removeEvents();
    };
  }
}

export default LineChart;
