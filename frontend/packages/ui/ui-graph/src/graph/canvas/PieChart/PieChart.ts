import {
  PieChartParam,
  SizeType,
  PieChartDataTypes,
  PieChartElement,
  LabelType,
  EachDataAreaType,
  pieChartPrimaryStyle,
  ChartBolderType,
} from './PieChartTypes';

class PieChart {
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D | null;

  private data?: PieChartDataTypes[];

  private expressionData: PieChartElement[];

  private eachDataArea: EachDataAreaType[][];

  private canvasSize: SizeType;

  private chartSize: number;

  private chartPosition: {
    x: number;
    y: number;
  };

  private chartFillColor: string;

  private chartBolder?: ChartBolderType;

  private centerText?: LabelType;

  private totalValue?: number;

  private radius: number = 0;

  private degree: number = 360;

  private circumference: number = Math.PI / 180;

  private centerArcDegree: number = 0;

  /**
   * craete PieChart
   * @param {string} eleId
   * @param {number | undefined} chartSize
   * @param {{
   *  title?: {
   *    text: string,
   *    color?: string,
   *    style?: string,
   *  },
   *  color: string,
   *  style: string,
   * }[]} data
   * @param {string | undefined} chartFillColor
   * @param {{
   *  designationBolder?: 'large' | 'medium' | 'small' | 'x-small',
   *  custom?: number,
   * }} chartBolder
   * @param {{
   *  text? {
   *    text: any | any[],
   *    color?: string,
   *    style?: string,
   *  }
   * }} centerText
   * @param {number | undefined} totalValue
   */
  constructor(params: PieChartParam) {
    const {
      canvas,
      chartSize,
      data,
      chartFillColor,
      chartBolder,
      centerText,
      totalValue,
    } = params;

    /**
     * HTMLCanvasElement
     * @type {HTMLCanvasElement}
     * */
    this.canvas = canvas;
    /**
     * Canvas 크기 설정
     */
    this.canvas.width = chartSize || pieChartPrimaryStyle.CHART_SIZE;
    this.canvas.height = chartSize || pieChartPrimaryStyle.CHART_SIZE;

    /**
     * canvas 2d context
     * @type {CanvasRenderingContext2D}
     * */
    this.ctx = this.canvas.getContext('2d');

    /**
     * chart 크기
     * @type {number}
     * */
    this.chartSize = chartSize || pieChartPrimaryStyle.CHART_SIZE;

    /**
     * canvas의 높이 / 너비
     * @type {{
     *  width: number,
     *  height: number,
     * }}
     * */
    this.canvasSize = {
      width: this.canvas.width,
      height: this.canvas.height,
    };

    /**
     * chart에 표현할 데이터
     * @type {{
     *  title?: {
     *   text: string,
     *   color?: string,
     *   style?: string,
     *  },
     *  color: string,
     *  style: string,
     * }[]}
     */
    this.data = data;

    /**
     * chart의 기본 색상
     * @type {string}
     */
    this.chartFillColor = chartFillColor || pieChartPrimaryStyle.CHART_COLOR;

    /**
     * chart의 굵기
     * @type {{
     *  designationBolder?: 'large' | 'medium' | 'small' | 'x-small',
     *  custom?: number
     * }}
     */
    this.chartBolder = chartBolder;

    /**
     * 차트 중앙에 작성할 글씨
     * @type {{
     *  text? {
     *    text: any | any[],
     *    color?: string,
     *    style?: string,
     *  }
     * }}
     */
    this.centerText = centerText;

    /**
     * 차트에 표현될 데이터의 총합
     * @type {number}
     */
    this.totalValue = totalValue;

    /**
     * chart에 표현할 데이터를 담아두는 배열
     * @type {{
     *  title?: {
     *    text: string,
     *    color?: string,
     *    style?: string,
     *  },
     *  color?: string,
     *  style?: string,
     *  angleValue: number;
     * }[]}
     */
    this.expressionData = [];

    /**
     * 각 데이터별 시작각도와 종료각도 및 타이틀을 저장하는 배열
     * @type {{
     *  title?: {
     *    text: string,
     *    color?: string,
     *    style?: string,
     *  },
     * startEndDegree: number
     * }[]}
     */
    this.eachDataArea = data ? data.slice().map(() => []) : [];

    /**
     * chart의 반지름
     * @type {number}
     */
    this.radius = (chartSize || pieChartPrimaryStyle.CHART_SIZE) / 2 - 1;

    /**
     * chart의 위치값 저장
     * @type {{
     *  x: number,
     *  y: number,
     * }}
     */
    this.chartPosition = {
      x: this.canvasSize.width / 2,
      y: this.canvasSize.height / 2,
    };
  }

  // 해상도 보정
  private correction() {
    if (this.ctx) {
      const dpr = window.devicePixelRatio;
      this.canvas.style.width = `${this.chartSize}px`;
      this.canvas.style.height = `${this.chartSize}px`;
      this.canvas.width = (this.chartSize || 100) * dpr;
      this.canvas.height = (this.chartSize || 100) * dpr;
      this.ctx.scale(dpr, dpr);
    }
  }

  // Chart를 그릴 영역을 계산하는 함수
  private calcData() {
    // data 총합 계산
    let totalSum = 0;
    let mod: number = 0;
    if (this.data) {
      this.data.forEach((element: PieChartDataTypes) => {
        totalSum += element.value;
      });
    }
    if (this.totalValue) {
      if (this.totalValue < totalSum) this.totalValue = totalSum;
      else mod = this.totalValue - totalSum;
    }

    // data 비율 할당
    if (this.data) {
      this.data.forEach((element: PieChartDataTypes) => {
        const rate = element.value / (this.totalValue || totalSum);
        this.expressionData.push({
          title: element.title,
          titlePosition: element.titlePosition,
          value: element.value,
          color: element.color,
          angleValue: this.degree * rate,
        });
      });
    }

    if (this.totalValue && mod > 0) {
      const rate = mod / this.totalValue;
      this.expressionData.push({
        value: mod,
        color: this.chartFillColor,
        angleValue: this.degree * rate,
      });
    }
  }

  // Chart의 중앙을 뚫는 함수
  private centerMake() {
    this.centerArcDegree = 0.5;
    const {
      ctx,
      chartPosition,
      radius,
      circumference,
      canvasSize,
      chartBolder,
    } = this;
    if (ctx) {
      if (chartBolder && chartBolder.designatedBolder) {
        switch (chartBolder.designatedBolder.toLowerCase()) {
          case 'large':
            this.centerArcDegree = 0.5;
            break;
          case 'medium':
            this.centerArcDegree = 0.55;
            break;
          case 'small':
            this.centerArcDegree = 0.65;
            break;
          case 'x-small':
            this.centerArcDegree = 0.7;
            break;
          case 'custom':
            if (chartBolder.custom && chartBolder.custom < 1)
              this.centerArcDegree = chartBolder.custom;
            else this.centerArcDegree = 0;
            break;
          default:
            this.centerArcDegree = 0.5;
        }
      } else if (chartBolder?.custom && chartBolder?.custom < 1) {
        this.centerArcDegree = chartBolder.custom;
      }
      this.degree = 0;
      ctx.save();

      ctx.beginPath();
      ctx.moveTo(chartPosition.x, chartPosition.y);
      ctx.arc(
        chartPosition.x,
        chartPosition.y,
        radius * this.centerArcDegree,
        0,
        circumference * 360,
        false,
      );
      ctx.clip();
      ctx.closePath();

      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      ctx.restore();
    }
  }

  // Chart를 그리는 함수
  private drawChart() {
    this.degree = 0;
    if (this.ctx) {
      for (let i: number = 0; i < this.expressionData.length; i++) {
        const { title, titlePosition, angleValue, color } =
          this.expressionData[i];
        const { ctx, chartPosition, radius, circumference } = this;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(chartPosition.x, chartPosition.y);
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        let angle = {
          start: 0,
          end: 0,
        };
        let startDegree: number = 0;
        let endDegree: number = 0;
        if (i === 0) {
          angle = {
            ...angle,
            end: circumference * angleValue,
          };
          startDegree = 0;
          endDegree = angleValue;
          this.degree = angleValue;
        } else {
          angle = {
            start: circumference * this.degree,
            end: circumference * (this.degree + angleValue),
          };
          startDegree = this.degree;
          endDegree = this.degree + angleValue;
          this.degree += angleValue;
        }
        ctx.arc(
          chartPosition.x,
          chartPosition.y,
          radius,
          angle.start,
          angle.end,
          false,
        );
        this.eachDataArea[i] = [
          {
            startEndDegree: startDegree,
            title,
            titlePosition,
          },
          {
            startEndDegree: endDegree,
          },
        ];
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
      this.centerMake();
    }
  }

  // 각도를 radian으로 바꾸는 함수
  private degreeToRadians(deg: number): number {
    return deg * this.circumference;
  }

  // Chart의 각 영역의 중앙에 title을 그리는 함수
  private titleDraw() {
    const { ctx, eachDataArea, radius, chartPosition, chartBolder } = this;
    if (ctx) {
      for (let i = 0; i < eachDataArea.length; i++) {
        const {
          title,
          startEndDegree: value,
          titlePosition,
        } = eachDataArea[i][0];
        if (title) {
          ctx.save();

          let position: number = 0.85;
          if (chartBolder?.designatedBolder) {
            switch (chartBolder.designatedBolder) {
              case 'large':
                position = 0.78;
                break;
              case 'medium':
                position = 0.8;
                break;
              case 'small':
                position = 0.85;
                break;
              case 'x-small':
                position = 0.87;
                break;
              default:
                break;
            }
          } else if (titlePosition) {
            position = titlePosition;
          }

          const half = (eachDataArea[i][1].startEndDegree - value) / 2;
          const deg = value + half;
          const dtr = this.degreeToRadians(deg);
          const xx = Math.cos(dtr) * (radius * position) + chartPosition.x;
          const yy = Math.sin(dtr) * (radius * position) + chartPosition.x;

          const minus = ctx.measureText(title.text).width / 2;

          ctx.font = title.style || pieChartPrimaryStyle.LABEL_STYLE;
          ctx.fillStyle = title.color || pieChartPrimaryStyle.LABEL_COLOR;
          ctx.fillText(title.text, xx - minus, yy);

          ctx.restore();
        }
      }
    }
  }

  // chart중앙에 text를 표현하는 함수
  private centerTextDraw() {
    const { ctx, centerText, chartPosition } = this;
    if (ctx && centerText) {
      const { text, style, color } = centerText;

      ctx.save();

      ctx.textAlign = 'center';
      ctx.font = style || pieChartPrimaryStyle.LABEL_STYLE;
      ctx.fillStyle = color || pieChartPrimaryStyle.LABEL_COLOR;

      if (Array.isArray(text) === true && text.length > 0) {
        const idx = {
          left: Math.floor(text.length / 2),
          right: Math.floor(text.length / 2) + 1,
        };

        const moduler: number = text.length % 2;

        const metrics = ctx.measureText(text[idx.left]);
        const fontHeight =
          metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

        const drawPos = {
          top: 0,
          bottom: 0,
        };

        if (moduler > 0) {
          drawPos.top = fontHeight / 2 - 1;
          drawPos.bottom = drawPos.top - (fontHeight + fontHeight / 2 + 7);
        } else {
          drawPos.top = fontHeight;
          drawPos.bottom = drawPos.top - fontHeight * 3;
        }

        while (idx.left >= 0 || idx.right < text.length) {
          if (idx.left >= 0) {
            const metrics = ctx.measureText(text[idx.left]);
            const fontHeight =
              metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
            ctx.fillText(
              text[idx.left],
              chartPosition.x,
              chartPosition.y + drawPos.top,
            );
            drawPos.top -= fontHeight;
          }
          if (idx.right < text.length) {
            const metrics = ctx.measureText(text[idx.right]);
            const fontHeight =
              metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
            ctx.fillText(
              text[idx.right],
              chartPosition.x,
              chartPosition.y - drawPos.bottom,
            );
            drawPos.bottom -= fontHeight;
          }
          idx.left--;
          idx.right++;
        }
      } else {
        ctx.fillText(text, chartPosition.x, chartPosition.y + 6);
      }

      ctx.restore();
    }
  }

  public draw() {
    this.correction();
    this.calcData();
    this.drawChart();
    this.titleDraw();
    if (this.centerText) this.centerTextDraw();
  }
}

export default PieChart;
