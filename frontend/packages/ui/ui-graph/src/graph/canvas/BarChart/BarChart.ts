import {
  BarChartParam,
  DataType,
  DrawParam,
  DataElement,
} from './BarChartTypes';

class BarChart {
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D | null;

  private tooltip: HTMLElement | null;

  private data: DataType[] | any;

  private minXAxis: number;

  private minYAxis: number;

  private maxXAxis: number;

  private maxYAxis: number;

  private minMax: {
    minX: boolean;
    minY: boolean;
    maxX: boolean;
    maxY: boolean;
  } = {
    minX: false,
    minY: false,
    maxX: false,
    maxY: false,
  };

  private unitsPerTickX: number;

  private unitsPerTickY: number;

  private padding: number;

  private tickSize: number;

  private axisColor: string;

  private font: string;

  private fontHeight: number;

  private rangeX: number;

  private rangeY: number;

  private numXTicks: number;

  private numYTicks: number;

  private x: number;

  private y: number;

  private width: number;

  private height: number;

  private scaleX: number;

  private scaleY: number;

  private xAxisSelector: string;

  private dataSelector: string;

  private barWidth: number;

  private barColor: string;

  private isAxisDraw: boolean;

  private xStart: number;

  constructor(param: BarChartParam) {
    const {
      canvas,
      data,
      width,
      height,
      minXAxis,
      minYAxis,
      maxXAxis,
      maxYAxis,
      unitsPerTickX,
      unitsPerTickY,
      axisColor,
      barWidth,
      barColor,
      background,
      isAxisDraw,
    } = param;

    /**
     * canvas element
     */
    this.canvas = canvas;

    /**
     * background 설정
     */
    if (background) {
      this.canvas.style.background = background;
    }

    /**
     * tooltip element
     */
    this.tooltip = null;

    /**
     * canvas 2d context
     */
    this.ctx = this.canvas.getContext('2d');

    /**
     * setting canvas width
     */
    this.canvas.width = width || 500;

    this.canvas.style.width = '100%';
    this.canvas.style.display = 'block';

    /**
     * setting canvas height
     */
    this.canvas.height = height || 300;

    this.data = data?.data || [];

    this.xStart = minXAxis || 0;

    if (maxXAxis === undefined) {
      this.maxXAxis = 0;
    } else {
      if (maxXAxis >= 0) {
        this.maxXAxis = maxXAxis;
      } else {
        this.maxXAxis = 0;
      }
      this.minMax.maxX = true;
    }

    if (maxYAxis === undefined) {
      this.maxYAxis = 0;
    } else {
      if (maxYAxis >= 0) {
        this.maxYAxis = maxYAxis;
      } else {
        this.maxYAxis = 0;
      }
      this.minMax.maxY = true;
    }

    if (minXAxis === undefined) {
      this.minXAxis = 0;
    } else {
      if (minXAxis >= 0) {
        this.minXAxis = minXAxis;
      } else {
        this.minXAxis = 0;
      }
      this.minMax.minX = true;
    }

    if (minYAxis === undefined) {
      this.minYAxis = 0;
    } else {
      if (minYAxis >= 0) {
        this.minYAxis = minYAxis;
      } else {
        this.minYAxis = 0;
      }
      this.minMax.minY = true;
    }

    /**
     * x축 tick당 값 설정
     */
    this.unitsPerTickX = unitsPerTickX || 5;

    /**
     * y축 tick당 값 설정
     */
    this.unitsPerTickY = unitsPerTickY || 5;

    /**
     * canvas padding 설정
     */
    this.padding = 7;

    /**
     * tick 표시 선 길이
     */
    this.tickSize = 10;

    /**
     * 축 색상 설정
     */
    this.axisColor = axisColor || '#555';

    /**
     * font 설정
     */
    this.font = 'normal bold 12px serif';

    this.fontHeight = 12;

    // initialize
    this.x = 0;

    this.y = 0;

    this.rangeX = 0;

    this.rangeY = 0;

    this.numXTicks = 0;

    this.numYTicks = 0;

    this.width = 0;

    this.height = 0;

    this.scaleX = 0;

    this.scaleY = 0;

    /**
     * data selector 설정
     */
    this.xAxisSelector = data?.xAxisSelector || 'xAxisData';

    this.dataSelector = data?.dataSelector || 'barData';

    /**
     * bar차트 막대 너비
     */
    this.barWidth = barWidth || 1;

    /**
     * bar 차트 기본 색상 설정
     */
    this.barColor = barColor || 'gray';

    /**
     * 축을 그리는 차트인지 설정
     */
    this.isAxisDraw = isAxisDraw === undefined ? true : isAxisDraw;
  }

  // x, y축 최대 최소값을 저장하는 메서드
  private minAndMax() {
    const { data, minMax, xAxisSelector, dataSelector } = this;

    data.forEach((d: any) => {
      if (d[dataSelector]) {
        if (typeof d[dataSelector] === 'number') {
          if (!minMax.minY) {
            this.minYAxis = Math.min(this.minYAxis, d[dataSelector]);
          }
          if (!minMax.maxY) {
            this.maxYAxis = Math.max(this.maxYAxis, d[dataSelector]);
          }
        } else {
          const arr = d[dataSelector];
          let max = 0;
          arr.forEach((val: any) => {
            max += val.value;
            if (!minMax.minY) {
              this.minYAxis = Math.min(this.minYAxis, val.value);
            }
          });
          if (!minMax.maxY) {
            this.maxYAxis = Math.max(this.maxYAxis, max);
          }
        }
      }

      if (d[xAxisSelector]) {
        if (!minMax.maxX) {
          this.maxXAxis = Math.max(this.maxXAxis, d[xAxisSelector]);
        }

        if (!minMax.minX) {
          this.minXAxis = Math.min(this.minXAxis, d[xAxisSelector]);
        } else if (d.length < this.minXAxis) {
          this.minXAxis = 0;
        }
      }
    });

    if (this.maxXAxis === 0) this.maxXAxis = data.length - 1;
    if (this.maxYAxis === 0) this.maxYAxis = data.length - 1;
  }

  private getLongestValueWidth(): number {
    if (this.ctx === null) return 0;
    const { ctx, font, numYTicks, maxYAxis, unitsPerTickY } = this;
    ctx.font = font;
    let longestValueWidth: number = 0;
    for (let n = 0; n < numYTicks; n++) {
      const value = String(maxYAxis - n * unitsPerTickY);
      longestValueWidth = Math.max(
        longestValueWidth,
        ctx.measureText(value).width,
      );
    }
    return longestValueWidth;
  }

  // chart의 비율 조정하는 메서드
  private calcRelation() {
    const {
      canvas,
      minMax,
      fontHeight,
      tickSize,
      unitsPerTickX,
      unitsPerTickY,
    } = this;

    if (this.isAxisDraw === false) {
      this.padding = 0;
    }

    // x, y축 최대/최소값 저장
    if (!minMax.maxX || !minMax.maxY || !minMax.minX || !minMax.minY) {
      this.minAndMax();
    }

    if (this.data.length > this.minXAxis) {
      this.data = this.data.slice(this.minXAxis, this.maxXAxis + 1);
    }
    this.minXAxis = 0;
    this.maxXAxis = this.data.length - 1;

    this.rangeX = (this.maxXAxis as number) - (this.minXAxis as number);
    this.rangeY = (this.maxYAxis as number) - (this.minYAxis as number);

    this.numXTicks = Math.round(this.rangeX / unitsPerTickX);
    this.numYTicks = Math.round(this.rangeY / unitsPerTickY);

    this.x = this.getLongestValueWidth() + this.padding * 2;
    this.y = this.padding * 2;
    this.width = canvas.width - this.x - this.padding * 2 - tickSize;
    if (this.isAxisDraw === true) {
      this.height =
        canvas.height - this.y - this.padding - fontHeight - tickSize;
      this.scaleY = this.height / this.rangeY;
    } else {
      this.height = canvas.height;
      this.scaleY = this.height / this.rangeY;
    }

    this.scaleX = this.width / this.rangeX;
  }

  // x축을 그리는 메서드
  private drawXAxis() {
    const { ctx, x, y, width, height, axisColor } = this;
    if (ctx === null) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // x축 tick을 그리는 메서드
  private drawXTick() {
    if (this.ctx === null) return;
    const { ctx, numXTicks, tickSize, x, y, width, height } = this;

    ctx.save();
    ctx.fillStyle = 'black';
    ctx.moveTo(x, y + height);
    ctx.lineTo(x, y + height + tickSize);
    ctx.stroke();

    ctx.save();
    for (let i = 0; i < numXTicks; i++) {
      const tmpX = ((i + 1) * width) / numXTicks + x;
      const tmpY = y + height;
      ctx.beginPath();
      ctx.moveTo(tmpX, tmpY);
      ctx.lineTo(tmpX, tmpY + tickSize);
      ctx.stroke();
    }
    ctx.restore();
  }

  // x축의 value를 그리는 메서드
  private drawXValue() {
    if (this.ctx === null) return;
    const {
      ctx,
      width,
      height,
      xStart: start,
      x,
      y,
      padding,
      font,
      numXTicks,
      maxXAxis,
      minXAxis,
      tickSize,
    } = this;
    ctx.save();

    ctx.font = font;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.save();
    ctx.translate(x, y + height + padding + tickSize);
    ctx.fillText(String(start), 0, 0);
    ctx.restore();
    for (let i = 0; i <= maxXAxis - minXAxis; i++) {
      const label = start + i + 1;
      ctx.save();
      ctx.translate(
        ((i + 1) * width) / numXTicks + x,
        y + height + padding + tickSize,
      );
      ctx.fillText(String(label), 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  // y축을 그리는 메서드
  private drawYAxis() {
    const { ctx, x, y, axisColor, height } = this;
    if (ctx === null) return;
    ctx.save();

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.moveTo(x, y + height);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.restore();
  }

  // y축 tick을 그리는 메서드
  private drawYTick() {
    if (this.ctx === null) return;
    const { ctx, height, numYTicks, x, y, tickSize } = this;
    ctx.save();
    for (let i = 0; i < numYTicks; i++) {
      const tmpY = (i * height) / numYTicks + y;
      ctx.beginPath();
      ctx.moveTo(this.x, tmpY);
      ctx.lineTo(x - tickSize, tmpY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // y축의 value를 그리는 메서드
  private drawYValue() {
    const {
      ctx,
      x,
      y,
      font,
      padding,
      numYTicks,
      maxYAxis,
      height,
      tickSize,
    } = this;
    if (ctx === null) return;

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < numYTicks; i++) {
      const value = Math.floor(maxYAxis - (i * maxYAxis) / numYTicks);
      ctx.save();
      ctx.translate(x - padding - tickSize / 2, (i * height) / numYTicks + y);
      ctx.fillText(String(value), 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  // chart를 축 위에 그리는 메서드
  private drawChart() {
    const {
      ctx,
      data,
      x,
      y,
      height,
      scaleX,
      scaleY,
      xAxisSelector,
      dataSelector,
      barWidth,
      barColor,
    } = this;
    if (ctx === null || !data) return;
    ctx.save();

    // transform context
    ctx.translate(x, y + height);
    ctx.scale(1, -1);

    ctx.beginPath();
    const startX = data[0][xAxisSelector] || 0;
    const startY = data[0][dataSelector] || 0;
    ctx.moveTo(startX, startY);

    // data 순회하며 chart를 그려나감
    data.forEach((point: any, i: number) => {
      const x = i;
      const bar = point[dataSelector];
      if (bar) {
        ctx.save();
        const sX = x * scaleX;
        if (typeof bar === 'number') {
          ctx.fillStyle = barColor;
          const barHeight = bar * scaleY;
          if (this.isAxisDraw === false) {
            ctx.fillRect(sX - barWidth / 2, 0, barWidth, barHeight);
          } else {
            if (i === 0) {
              ctx.fillRect(sX, 1, barWidth / 2, barHeight);
            } else if (i === data.length - 1 && x >= this.maxXAxis) {
              ctx.fillRect(sX - barWidth / 2, 1, barWidth / 2 + 1, barHeight);
            } else {
              ctx.fillRect(sX - barWidth / 2, 1, barWidth, barHeight);
            }
          }
        } else {
          let prev = 0;
          bar.forEach((d: DataElement) => {
            const barHeight = d.value * scaleY;
            ctx.fillStyle = d.color || barColor;
            if (this.isAxisDraw === false) {
              ctx.fillRect(sX - barWidth / 2, prev, barWidth, barHeight);
            } else {
              if (i === 0) {
                ctx.fillRect(sX, prev, barWidth / 2, barHeight);
              } else if (i === data.length - 1 && x >= this.maxXAxis) {
                ctx.fillRect(
                  sX - barWidth / 2,
                  prev,
                  barWidth / 2 + 1,
                  barHeight,
                );
              } else {
                ctx.fillRect(sX - barWidth / 2, prev, barWidth, barHeight);
              }
            }
            prev += barHeight;
          });
        }

        ctx.restore();
      }
    });

    ctx.restore();
  }

  // tooltip visible 설정 메서드
  private tooltipMaker(px: number, py: number) {
    if (!this.tooltip) return;
    const { tooltip } = this;
    tooltip.style.display = 'block';
    tooltip.style.left = `${px + px * 0.02}`;
    tooltip.style.top = `${py + py * 0.02}`;
  }

  // tooltip 기능 메서드
  private drawTooltip(tooltipStyle?: { [key: string]: string }) {
    const { canvas } = this;

    this.tooltip = document.createElement('div');
    canvas.parentElement?.append(this.tooltip);
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.display = 'none';
    this.tooltip.style.width = '50px';
    this.tooltip.style.height = 'auto';
    this.tooltip.style.padding = '5px';
    this.tooltip.style.border = '1px solid #000000';
    this.tooltip.style.backgroundColor = '#ffffff';
    this.tooltip.style.borderRadius = '3px';

    if (tooltipStyle) {
      Object.keys(tooltipStyle).forEach((key: string) => {
        if (
          this.tooltip &&
          key !== 'display' &&
          key !== 'position' &&
          (this.tooltip.style as any)[key] !== undefined
        ) {
          (this.tooltip.style as any)[key] = tooltipStyle[key];
        }
      });
    }

    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const px = e.pageX;
      const py = e.pageY;
      // this.innerArea(px, py);
      this.tooltipMaker(px, py);
    });
    canvas.addEventListener('mouseleave', () => {
      if (this.tooltip) this.tooltip.style.display = 'none';
    });
  }

  // chart 전체를 그리는 메서드
  public draw(draw?: DrawParam) {
    if (this.ctx === null) return;
    if (!this.data) return;
    if (this.data.length === 0) return;

    const activeTooltip =
      draw?.activeTooltip !== undefined ? draw.activeTooltip : true;
    const tooltipStyle =
      draw?.tooltipStyle !== undefined ? draw.tooltipStyle : undefined;

    this.calcRelation();

    this.drawChart();

    if (this.isAxisDraw) {
      const drawXAxis = draw?.drawXAxis !== undefined ? draw.drawXAxis : true;
      const drawXValue =
        draw?.drawXValue !== undefined ? draw.drawXValue : true;
      const drawXTick = draw?.drawXTick !== undefined ? draw.drawXTick : true;
      const drawYAxis = draw?.drawYAxis !== undefined ? draw.drawYAxis : true;
      const drawYValue =
        draw?.drawYValue !== undefined ? draw.drawYValue : true;
      const drawYTick = draw?.drawYTick !== undefined ? draw.drawYTick : true;

      if (drawXAxis) this.drawXAxis();
      if (drawXTick) this.drawXTick();
      if (drawXValue) this.drawXValue();

      if (drawYAxis) this.drawYAxis();
      if (drawYTick) this.drawYTick();
      if (drawYValue) this.drawYValue();
    }
    // if (activeTooltip) this.drawTooltip(tooltipStyle);
  }
}

export default BarChart;
