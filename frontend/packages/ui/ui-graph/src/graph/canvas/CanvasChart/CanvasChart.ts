import * as GlobalType from '@src/types';
import * as CanvasChartTypes from './CanvasChartTypes';

class CanvasChart {
  /**
   * HTML5 Canvas 설정
   */
  protected parentNode: HTMLElement | null;

  protected parentNodeId: string;

  protected canvasContainer: HTMLElement | null;

  protected canvasLayer: CanvasChartTypes.CanvasLayerType[];

  protected tooltip: HTMLElement | null;

  protected tooltipTemplate: string | null;

  protected legend: HTMLElement | null;

  protected events: Array<any>;

  protected width: number;

  protected height: number;

  protected mainChartIdx: number;

  protected animationChartIdx: number;

  protected defaultValue: GlobalType.ObjectType;

  constructor({
    nodeId,
    width,
    height,
    canvasLayer,
  }: CanvasChartTypes.CanvasChartParam) {
    this.defaultValue = {
      value: 0,
      padding: 7,
      lineWidth: 1,
      place: 20,
      color: '#000',
      unitsPerTick: 1,
      font: 'normal 12px sans-serif',
      fontHeight: 12,
      background: '#FFF',
      pointRadius: 3,
    };

    this.mainChartIdx = 0;

    this.animationChartIdx = 0;

    this.parentNode = null;

    this.parentNodeId = nodeId;

    /**
     * canvas 레이어 설정
     */
    this.canvasContainer = document.createElement('div');

    this.canvasContainer.style.position = 'relative';

    const dpr = window.devicePixelRatio;

    /**
     * canvas 레이어 구축
     */
    this.canvasLayer = [];
    canvasLayer.forEach((level: CanvasChartTypes.CanvasLayer, idx: number) => {
      const { type, id, canvasStyle } = level;
      this.canvasLayer[idx] = {
        type,
        id,
        canvasStyle,
        canvas: document.createElement('canvas') as HTMLCanvasElement,
        ctx: null,
      };
      if (type === 'main') {
        this.mainChartIdx = idx;
      } else if (type === 'animation') {
        this.animationChartIdx = idx;
      }
      this.canvasLayer[idx].canvas.id = `${type}-canvas`;
      Object.entries(canvasStyle).forEach(([key, value]) => {
        (this.canvasLayer[idx].canvas?.style as any)[key] = value;
      });
      this.canvasLayer[idx].ctx = this.canvasLayer[idx].canvas.getContext('2d');
      this.canvasLayer[idx].canvas.style.position = 'absolute';
      this.canvasLayer[idx].canvas.style.width = '100%';

      // anti aliasing 보정
      this.canvasLayer[idx].canvas.width = width * dpr;
      this.canvasLayer[idx].canvas.height = height * dpr;
      this.canvasLayer[idx].ctx?.scale(dpr, dpr);
      this.canvasContainer?.appendChild(this.canvasLayer[idx].canvas);
    });

    this.width = this.defaultValue.value;

    this.height = this.defaultValue.value;

    this.events = [];

    this.tooltip = null;

    this.tooltipTemplate = null;

    this.legend = null;
  }

  /**
   * canvasLayer[canvasIdx]의 배경 수정
   */
  protected ctxFillRect(canvasIdx: number) {
    if (this.canvasLayer.length - 1 < canvasIdx) return;
    const { canvasLayer, defaultValue } = this;
    const { canvas, ctx, canvasStyle } = canvasLayer[canvasIdx];
    if (ctx === null) return;
    ctx.save();

    ctx.fillStyle = canvasStyle.background || defaultValue.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  }

  protected ctxClear() {
    const { canvasLayer } = this;
    canvasLayer.forEach((layer: CanvasChartTypes.CanvasLayerType) => {
      const { canvas, ctx } = layer;
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  /**
   * mouse 커서의 좌표 계산
   * @param x - mouseover이벤트의 e.clientX
   * @param y - mouseover이벤트의 e.clientY
   * @returns - 마우스 좌표
   */
  protected mousePosition(x: number, y: number) {
    const { canvasLayer, mainChartIdx } = this;
    const { canvas } = canvasLayer[mainChartIdx];
    const bbox = canvas.getBoundingClientRect();
    return {
      x: (x - bbox.left) * (canvas.width / bbox.width),
      y: (y - bbox.top) * (canvas.height / bbox.height),
    };
  }

  /**
   * Canvas 크기보정
   */
  protected correctionCanvas() {
    const dpr = window.devicePixelRatio;

    this.canvasLayer.forEach((layer: CanvasChartTypes.CanvasLayerType) => {
      const { canvas } = layer;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    });
  }

  /**
   * canvas observer 메서드
   * @param run canvas노드를 감지했을때 실행할 메서드
   * @param stop canvas노드가 사라졌을때 실행할 메서드
   */
  protected canvasObserver(run?: () => void, stop?: () => void) {
    if (this.canvasContainer === null) return;
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          const { isIntersecting } = entry;
          if (isIntersecting) {
            if (run) run();
          } else {
            if (stop) stop();
          }
        });
      },
    );
    observer.observe(this.canvasContainer);
  }

  /**
   * event함수를 관리하는 events 배열
   * @param eventFunc
   */
  protected addEvents(eventFunc: Array<any>) {
    this.events = eventFunc;
  }

  /**
   * event remove
   */
  protected removeEvents() {
    this.events.forEach((removeEvent: (() => void) | null) => {
      if (removeEvent !== null) removeEvent();
    });
  }

  protected appendCanvasNode() {
    this.parentNode = document.getElementById(this.parentNodeId);
    if (this.parentNode !== null && this.canvasContainer !== null) {
      this.parentNode.innerHTML = '';
      this.parentNode.appendChild(this.canvasContainer);
    }
  }
}

export default CanvasChart;
