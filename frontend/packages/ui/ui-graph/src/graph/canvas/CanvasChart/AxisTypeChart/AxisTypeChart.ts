import { throttle } from 'lodash';
import { crispPixel } from '../../untils';

import CanvasChart from '../CanvasChart';
import * as AxisChartType from './AxisTypeChartTypes';
import { Vector } from '@src/types';

class AxisTypeChart extends CanvasChart {
  protected series: AxisChartType.SeriesDataType | null;

  protected axis: AxisChartType.AxisType | null;

  protected font: string;

  protected fontHeight: number;

  protected range: AxisChartType.AxisPositionType<number>;

  protected scale: number;

  protected startPoint: AxisChartType.AxisPositionType<Vector>;

  protected area: {
    start: Vector;
    end: Vector;
  };

  protected elementArea: AxisChartType.AxisPositionType<number>;

  protected middlePosition: number;

  protected renderOption: AxisChartType.RenderOption;

  protected createdNode: {
    legend: boolean;
    tooltip: boolean;
  };

  constructor({
    nodeId,
    canvasLayer,
    width,
    height,
    font,
    fontHeight,
  }: AxisChartType.AxisTypeChartParam) {
    super({ nodeId, width, height, canvasLayer });
    this.series = null;

    this.axis = null;

    this.font = font || this.defaultValue.font;

    this.fontHeight = fontHeight || this.defaultValue.fontHeight;

    this.range = {
      bottom: 0,
      left: 0,
      right: 0,
    };

    this.scale = 0;

    this.startPoint = {
      bottom: {
        x: 0,
        y: 0,
      },
      left: {
        x: 0,
        y: 0,
      },
      right: {
        x: 0,
        y: 0,
      },
    };

    this.area = {
      start: {
        x: 0,
        y: 0,
      },
      end: {
        x: 0,
        y: 0,
      },
    };

    this.elementArea = {
      bottom: 0,
      left: 0,
      right: 0,
    };

    this.middlePosition = 0;

    this.legend = null;

    this.renderOption = {
      bottomAxis: true,
      bottomTick: true,
      bottomText: true,
      leftAxis: true,
      leftTick: true,
      leftText: true,
      rightAxis: true,
      rightTick: true,
      rightText: true,
      tooltip: true,
      legend: true,
      guideLine: true,
    };

    this.createdNode = {
      legend: false,
      tooltip: false,
    };

    this.tooltipTemplate = null;
  }

  /**
   * axis 최대, 최소값 설정
   */
  protected calcMax() {
    const { axis, series } = this;
    if (axis === null || series === null) return;

    // x축 (axis.bottom)의 max값 설정
    if (axis.bottom.max === 0 && axis.bottom.data.length > 0) {
      axis.bottom.max = axis.bottom.data.length - 1;
    }

    // left y축 max값 설정
    series.left.forEach((datas: AxisChartType.SeriesType) => {
      const { series } = datas;
      axis.left.max = Math.max(axis.left.max as number, ...series);
    });

    // right y축 max값 설정
    series.right.forEach((datas: AxisChartType.SeriesType) => {
      const { series } = datas;
      if (axis.right !== undefined) {
        axis.right.max = Math.max(axis.right.max as number, ...series);
      }
    });
  }

  /**
   * 그래프 비율 계산
   */
  protected calcRelation() {
    const {
      canvasLayer,
      mainChartIdx,
      axis,
      range,
      startPoint,
      fontHeight,
      defaultValue,
    } = this;
    if (axis === null) return;
    const { canvas } = canvasLayer[mainChartIdx];

    // bottom y축 범위 계산
    const bottomMax = axis.bottom.max;
    const bottomMin = axis.bottom.min;
    range.bottom = bottomMax - bottomMin;

    // left y축 범위 계산
    const leftMax = axis.left.max;
    const leftMin = axis.left.min;
    range.left = leftMax - leftMin;

    const leftMode = range.left % axis.left.unitsPerTick;
    if (leftMode !== 0) {
      axis.left.max += axis.left.unitsPerTick - leftMode;
      range.left = axis.left.max - leftMin;
    }

    // right y축 범위 계산
    const rightMax = axis.right.max;
    const rightMin = axis.right.min;
    range.right = rightMax - rightMin;

    const rightMod = range.right % axis.right.unitsPerTick;
    if (rightMod !== 0) {
      axis.right.max += axis.right.unitsPerTick - rightMod;
      range.right = axis.right.max - rightMin;
    }

    // 축 시작점 계산
    startPoint.bottom.x =
      axis.left.padding * 2 + axis.left.tickSize + defaultValue.place;

    // 축 width, height 계산
    this.width =
      canvas.width -
      startPoint.bottom.x -
      axis.left.padding * 2 -
      axis.right.padding * 2 -
      axis.left.tickSize -
      axis.right.tickSize;
    this.height =
      canvas.height -
      startPoint.bottom.x -
      axis.bottom.padding -
      fontHeight -
      axis.bottom.tickSize;

    // 축 시작점 계산
    startPoint.bottom.y = axis.left.padding * 2 + this.height;
    startPoint.left = {
      x: startPoint.bottom.x,
      y: startPoint.bottom.y,
    };

    startPoint.right = {
      x: startPoint.left.x + this.width,
      y: startPoint.left.y,
    };

    this.area = {
      start: {
        x: startPoint.bottom.x,
        y: startPoint.bottom.y,
      },
      end: {
        x: startPoint.bottom.x + this.width,
        y: startPoint.bottom.y - this.height,
      },
    };

    this.scale = this.width / this.range.bottom;
    if (this.scale === Infinity) {
      this.scale = 1;
    }

    this.elementArea = {
      bottom: (this.area.end.x - this.area.start.x) / this.range.bottom,
      left: (this.area.start.y - this.area.end.y) / this.range.left,
      right: (this.area.start.y - this.area.end.y) / this.range.right,
    };

    this.middlePosition =
      this.area.start.x + (this.area.end.x - this.area.start.x) / 2;
  }

  /**
   * draw x축, y축
   */
  protected drawAxis() {
    if (this.renderOption.bottomAxis === false) return;
    const {
      canvasLayer,
      width,
      height,
      axis,
      startPoint,
      mainChartIdx,
      renderOption,
      defaultValue,
    } = this;
    const { ctx } = canvasLayer[mainChartIdx];
    if (ctx === null || axis === null) return;
    ctx.save();
    // x축 그리기
    let lineWidth = 1;
    let xPoint = 0;
    let yPoint = 0;
    if (renderOption.bottomAxis) {
      lineWidth = axis.bottom.lineWidth || defaultValue.lineWidth;
      xPoint = startPoint.bottom.x;
      yPoint = crispPixel(startPoint.bottom.y, lineWidth);
      ctx.strokeStyle = axis.bottom.color || defaultValue.color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(xPoint, yPoint);
      ctx.lineTo(xPoint + width, yPoint);
      ctx.stroke();
      ctx.closePath();
    }

    // left y축 그리기
    if (renderOption.leftAxis) {
      lineWidth = axis.left.lineWidth || defaultValue.lineWidth;
      xPoint = crispPixel(startPoint.left.x, lineWidth);
      yPoint = startPoint.left.y;
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = axis.left.color || defaultValue.color;
      ctx.beginPath();
      ctx.moveTo(xPoint, yPoint);
      ctx.lineTo(xPoint, yPoint - height);
      ctx.stroke();
      ctx.closePath();
    }

    // right y축 그리기
    if (renderOption.rightAxis) {
      lineWidth = axis.right.lineWidth || defaultValue.lineWidth;
      xPoint = crispPixel(startPoint.right.x, lineWidth);
      yPoint = startPoint.right.y;
      ctx.strokeStyle = axis.right.color || defaultValue.color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(xPoint, yPoint - height);
      ctx.lineTo(xPoint, yPoint);
      ctx.stroke();
      ctx.closePath();
    }

    ctx.restore();
  }

  /**
   * draw x축 tick, text
   */
  protected drawBottomTickAndText() {
    if (
      this.renderOption.bottomTick === false &&
      this.renderOption.bottomText === false
    )
      return;
    const {
      canvasLayer,
      range,
      elementArea,
      axis,
      font,
      startPoint,
      fontHeight,
      mainChartIdx,
      renderOption,
    } = this;
    const { ctx } = canvasLayer[mainChartIdx];
    if (ctx === null || axis === null) return;

    ctx.save();

    const { tickSize } = axis.bottom;

    const { lineWidth } = axis.bottom;
    if (renderOption.bottomTick) {
      ctx.strokeStyle = axis.bottom.color;
      ctx.lineWidth = axis.bottom.lineWidth;
    }
    if (renderOption.bottomText) {
      ctx.font = font;
      ctx.fillStyle = axis.bottom.color;
    }
    for (let i = 0; i <= range.bottom; i += axis.bottom.unitsPerTick) {
      const xPoint = crispPixel(
        i * elementArea.bottom + startPoint.bottom.x,
        lineWidth,
      );
      const yPoint = startPoint.bottom.y;

      ctx.beginPath();

      if (renderOption.bottomTick) {
        ctx.moveTo(xPoint, yPoint);
        ctx.lineTo(xPoint, yPoint + tickSize);
        ctx.stroke();
      }

      let value = '';
      if (axis.bottom.data && axis.bottom.data.length > 1) {
        value = String(axis.bottom.data[i]);
      } else {
        value = String(i);
      }

      if (renderOption.bottomText) {
        const valueLen = ctx.measureText(value).width;
        ctx.fillText(
          value,
          xPoint - valueLen / 2,
          yPoint + tickSize + fontHeight,
        );
      }
      ctx.closePath();
    }

    // 마지막 요소 출력
    if (range.bottom % axis.bottom.unitsPerTick !== 0) {
      const xPoint = crispPixel(
        axis.bottom.max * elementArea.bottom + startPoint.bottom.x,
        lineWidth,
      );
      const yPoint = startPoint.bottom.y;

      ctx.beginPath();

      if (renderOption.bottomTick) {
        ctx.moveTo(xPoint, yPoint);
        ctx.lineTo(xPoint, yPoint + tickSize);
        ctx.stroke();
      }

      let value = '';
      if (axis.bottom.data && axis.bottom.data.length > 1) {
        value = String(axis.bottom.data[axis.bottom.data.length - 1]);
      } else {
        value = String(axis.bottom.max);
      }

      if (renderOption.bottomText) {
        const valueLen = ctx.measureText(value).width;
        ctx.fillText(
          value,
          xPoint - valueLen / 2,
          yPoint + tickSize + fontHeight,
        );
      }
    }

    ctx.restore();
  }

  /**
   * draw left y축 tick, text
   */
  protected drawLeftTickAndText() {
    if (
      this.renderOption.leftTick === false &&
      this.renderOption.leftText === false
    )
      return;
    const {
      canvasLayer,
      mainChartIdx,
      startPoint,
      elementArea,
      font,
      fontHeight,
      axis,
      range,
      defaultValue,
      renderOption,
    } = this;
    const { ctx } = canvasLayer[mainChartIdx];
    if (ctx === null || axis === null) return;

    ctx.save();

    ctx.beginPath();
    const lineWidth = axis.left.lineWidth || defaultValue.lineWidth;
    if (renderOption.leftTick) {
      ctx.strokeStyle = axis.left.color;
      ctx.lineWidth = lineWidth;
    }

    if (renderOption.leftText) {
      ctx.font = font;
      ctx.fillStyle = axis.left.color;
    }

    for (let i = 0; i <= range.left; i += axis.left.unitsPerTick) {
      const xPoint = startPoint.left.x;
      const yPoint = crispPixel(
        startPoint.left.y - i * elementArea.left,
        lineWidth,
      );
      ctx.beginPath();
      if (renderOption.leftTick) {
        ctx.moveTo(xPoint, yPoint);
        ctx.lineTo(xPoint - axis.left.tickSize, yPoint);
        ctx.stroke();
      }

      if (renderOption.leftText) {
        const value = String(axis.left.min + i);
        ctx.fillText(
          value,
          xPoint - axis.left.tickSize - ctx.measureText(value).width - 7,
          yPoint + fontHeight / 2,
        );
      }
      ctx.closePath();
    }

    ctx.restore();
  }

  /**
   * draw right y축 tick, value
   */
  protected drawRightTickAndText() {
    if (
      this.renderOption.rightText === false &&
      this.renderOption.rightTick === false
    )
      return;
    const {
      canvasLayer,
      mainChartIdx,
      range,
      startPoint,
      axis,
      font,
      fontHeight,
      renderOption,
    } = this;
    const { ctx } = canvasLayer[mainChartIdx];
    if (ctx === null || axis === null) return;

    ctx.save();
    ctx.beginPath();

    const { lineWidth } = axis.right;
    if (renderOption.rightTick) {
      ctx.strokeStyle = axis.right.color;
      ctx.lineWidth = lineWidth;
    }

    if (renderOption.rightText) {
      ctx.font = font;
      ctx.fillStyle = axis.right.color;
    }
    ctx.closePath();

    for (let i = 0; i <= range.right; i += axis.right.unitsPerTick) {
      const xPoint = startPoint.right.x;
      const yPoint = crispPixel(
        startPoint.right.y - i * this.elementArea.right,
        lineWidth,
      );

      ctx.beginPath();

      if (renderOption.rightTick) {
        ctx.moveTo(xPoint, yPoint);
        ctx.lineTo(xPoint + axis.right.tickSize, yPoint);
        ctx.stroke();
      }

      if (renderOption.rightText) {
        const value = String(axis.right.min + i);
        ctx.fillText(
          value,
          xPoint + axis.right.tickSize + 7,
          yPoint + fontHeight / 2,
        );
      }

      ctx.closePath();
    }

    ctx.restore();
  }

  /**
   * tooltip 생성
   */
  protected tooltipSetting() {
    if (
      this.renderOption.tooltip &&
      this.createdNode.tooltip === false &&
      this.parentNode !== null
    ) {
      this.tooltip = document.createElement('div');
      this.tooltip.style.position = 'absolute';
      this.tooltip.style.display = 'none';
      this.tooltip.style.width = 'auto';
      this.tooltip.style.height = 'auto';
      this.tooltip.style.zIndex = '10';
      this.createdNode.tooltip = true;
      this.parentNode.insertAdjacentElement('beforeend', this.tooltip);
    }
  }

  /**
   * Draw legend
   */
  protected drawLegend() {
    if (
      this.renderOption.legend === true &&
      this.createdNode.legend === false
    ) {
      this.legend = document.createElement('div');
      this.legend.style.position = 'absolute';
      this.legend.style.display = 'flex';
      this.legend.style.left = '50%';
      this.legend.style.marginTop = `${this.height + 50}px`;
      this.legend.style.transform = 'translate(-50%, 0%)';
      this.canvasContainer?.appendChild(this.legend);
      this.createdNode.legend = true;
    }

    const { legend, series } = this;
    if (legend === null || series === null) return;

    legend.innerHTML = '';

    series.left.forEach((s) => {
      const { color, name } = s;
      const node = document.createElement('div');
      node.style.display = 'flex';
      node.style.justifyContent = 'center';
      node.style.alignItems = 'center';
      const seriesTemplate = `
        <div style='background-color:${color};border-radius:50%;width:5px;height:5px;margin-right:3px;'></div>
        <div style='color:${color};margin-right:5px;font:${this.font}'>${name}</div>
      `;
      node.innerHTML = seriesTemplate;
      legend.appendChild(node);
    });

    series.right.forEach((s) => {
      const { color, name } = s;
      const node = document.createElement('div');
      node.style.display = 'flex';
      node.style.justifyContent = 'center';
      node.style.alignItems = 'center';
      const seriesTemplate = `
        <div style='background-color:${color};border-radius:50%;width:5px;height:5px;margin-right:3px;'></div>
        <div style='color:${color};margin-right:5px;font:${this.font}'>${name}</div>
      `;
      node.innerHTML = seriesTemplate;

      legend.appendChild(node);
    });
  }

  /**
   * 현재 mouseover에 대한 x축의 영역에 대한 값 반환
   * @param dataArea {number} x축 영역
   * @returns number - x축 영역별 값
   */
  private innerInfoBottomAxis(dataArea: number) {
    if (this.axis === null) return 0;
    const { axis } = this;
    if (axis.bottom.data) {
      return axis.bottom.data[dataArea];
    }
    return 0;
  }

  /**
   * 현재 mouseover에 대한 x축의 영역에 대한 left축에 종속된 데이터 정보 반환
   * @param dataArea {number} - mouseover x축 영역
   * @returns leftInfo - left축에 대한 데이터의 정보 배열
   */
  private innerInfoLeftData(dataArea: number) {
    const leftInfo: { name: string; color: string; data: number }[] = [];
    const { series, defaultValue } = this;
    if (series === null) return leftInfo;

    series.left.forEach((s: AxisChartType.SeriesType, i: number) => {
      const { name, color, series } = s;
      leftInfo[i] = {
        name,
        color: color || defaultValue.color,
        data: series[dataArea],
      };
    });

    return leftInfo;
  }

  /**
   * 현재 mouseover에 대한 x축의 영역에 대한 right축에 종속된 데이터 정보 반환
   * @param dataArea {number} - mouseover x축 영역
   * @returns rightInfo - right축에 대한 데이터의 정보 배열
   */
  private innerInfoRightData(dataArea: number) {
    const rightInfo: { name: string; color: string; data: number }[] = [];
    const { series, defaultValue } = this;
    if (series === null) return rightInfo;

    series.right.forEach((s: AxisChartType.SeriesType, i: number) => {
      const { name, series, color } = s;
      rightInfo[i] = {
        name,
        color: color || defaultValue.color,
        data: series[dataArea],
      };
    });

    return rightInfo;
  }

  /**
   * draw tooltip
   * @param x {number} mouse x좌표
   * @param y {number} mouse y좌표
   * @param outputPosX {number} tooltip이 표시될 x좌표
   * @param outputPosY {number} tooltip이 표시될 y좌표
   */
  protected tooltipMaker(
    x: number,
    y: number,
    outputPosX: number,
    outputPosY: number,
  ) {
    const { area, tooltip, elementArea, tooltipTemplate, axis, defaultValue } =
      this;
    if (axis === null || tooltip === null || tooltipTemplate === null) return;

    if (
      area.start.x <= x &&
      area.end.x >= x &&
      area.start.y >= y &&
      area.end.y <= y
    ) {
      // x축 정보
      const xAxisArea =
        Math.round(
          (x - area.start.x + elementArea.bottom) / elementArea.bottom,
        ) - 1;
      // left y축 정보
      // const leftAxisInfo =
      //   Math.round((area.start.y - y + elementArea.left) / elementArea.left) -
      //   1;

      // 현재 마우스 좌표에 대한 x축, series 정보
      const bottomAxisInfo = this.innerInfoBottomAxis(xAxisArea);
      const leftDataInfo = this.innerInfoLeftData(xAxisArea);
      const rightDataInfo = this.innerInfoRightData(xAxisArea);

      let template = `
        <div style='color: ${axis.bottom.color || defaultValue.color};'>${
        bottomAxisInfo || 0
      }</div>
      `;
      // let template = `
      //   <div style='color: ${axis.bottom.color || defaultValue.color};'></div>
      // `;

      // if (!Number.isNaN(leftAxisInfo)) {
      //   template = `
      //   ${template}
      //   <div style='color: ${axis.left.color || defaultValue.color};'>${
      //     axis.left.name || 'left Y axis'
      //   }: ${leftAxisInfo.toFixed(0)}</div>
      //   `;
      // }

      // right y축 정보
      // const rightAxisInfo =
      //   Math.round((area.start.y - y + elementArea.right) / elementArea.right) -
      //   1;
      // if (!Number.isNaN(rightAxisInfo)) {
      //   template = `${template}
      //     <div style='color: ${axis.right?.color || defaultValue.color};'>${
      //     axis.right?.name || 'right Y axis'
      //   }: ${rightAxisInfo.toFixed(0)}</div>`;
      // }

      if (x >= this.middlePosition) {
        tooltip.style.left = `${outputPosX - tooltip.clientWidth - 25}px`;
      } else {
        tooltip.style.left = `${outputPosX + 25}px`;
      }

      tooltip.style.display = 'block';
      tooltip.style.top = `${outputPosY + 25}px`;

      if (leftDataInfo.length > 0) {
        template = `
          ${template}
          <hr/>
          ${axis.left.name || 'left Y axis'}
        `;
      }

      leftDataInfo.forEach(
        (info: { name: string; color: string; data: number }) => {
          const { name, data, color } = info;
          template = `
              ${template}
              <div style='color: ${color}'}>${name}: ${data || 0}</div>
            `;
        },
      );

      if (rightDataInfo.length > 0) {
        template = `
          ${template}
          <hr/>
          ${axis.right?.name || 'right Y axis'}
        `;
      }
      rightDataInfo.forEach(
        (info: { name: string; color: string; data: number }) => {
          const { name, data, color } = info;
          template = `
              ${template}
              <div style='color: ${color}'}>${name}: ${data || 0}</div>
            `;
        },
      );
      template = tooltipTemplate.replace('{__contents__}', template);
      tooltip.style.alignItems = 'left';
      tooltip.innerHTML = template;

      return;
    }
    tooltip.style.display = 'none';
  }

  /**
   * 마우스 커서의 가이드라인 출력
   * @param x - 마우스 좌표 x
   * @param y - 마우스 좌표 y
   */
  protected drawGuidelines(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) {
    const { area, defaultValue } = this;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setLineDash([7]);
    ctx.strokeStyle = defaultValue.color;
    ctx.lineWidth = 1;

    if (
      area.start.x <= x &&
      area.end.x >= x &&
      area.start.y >= y &&
      area.end.y <= y
    ) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, area.start.y);
      ctx.lineTo(x + 0.5, area.end.y);
      ctx.stroke();
      ctx.moveTo(area.start.x, y + 0.5);
      ctx.lineTo(area.end.x, y + 0.5);
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  }

  protected mouseout() {
    const { canvasLayer, animationChartIdx, renderOption } = this;
    const { canvas, ctx } = canvasLayer[animationChartIdx];
    const mouseout = () => {
      if (ctx && renderOption.guideLine) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (this.tooltip) {
        this.tooltip.style.display = 'none';
      }
    };
    if (canvas) {
      canvas.addEventListener('mouseout', mouseout);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mouseout', mouseout);
      }
    };
  }

  /**
   * canvas 마우스 이벤트 등록
   */
  protected drawMouseOver(): (() => void) | null {
    const { canvasLayer, animationChartIdx } = this;
    const { canvas: animationCanvas, ctx: animationCtx } =
      canvasLayer[animationChartIdx];

    if (animationCtx === null) return null;

    const mouseEvent = (e: MouseEvent) => {
      const loc = this.mousePosition(e.clientX, e.clientY);
      if (this.renderOption.guideLine === true) {
        // 가이드라인 렌더
        this.drawGuidelines(animationCanvas, animationCtx, loc.x, loc.y);
      }
      if (this.renderOption.tooltip) {
        // tooltip 렌더
        this.tooltipTemplate = `
          <div style='padding: 16px;border: 1px solid rgb(177, 177, 177);background: #FFFFFF;border-radius: 5px;font-size: 14px;'>{__contents__}</div>
        `;
        this.tooltipMaker(loc.x, loc.y, e.pageX, e.pageY);
      }
    };

    if (animationCanvas) {
      animationCanvas.addEventListener('mouseenter', mouseEvent);
      animationCanvas.addEventListener('mousemove', mouseEvent);
    }
    return () => {
      animationCanvas?.removeEventListener('mouseenter', mouseEvent);
      animationCanvas?.removeEventListener('mousemove', mouseEvent);
    };
  }

  /**
   * canvas reactive
   */
  protected canvasResize(run?: () => void): () => void {
    const { legend } = this;
    const resizeEvent = throttle(() => {
      this.correctionCanvas();
      if (run) {
        run();
      }
      if (legend) {
        legend.style.marginTop = `${this.height + 50}px`;
      }
    }, 800);

    window.addEventListener('resize', resizeEvent);
    return () => {
      window.removeEventListener('resize', resizeEvent);
    };
  }
}

export default AxisTypeChart;
