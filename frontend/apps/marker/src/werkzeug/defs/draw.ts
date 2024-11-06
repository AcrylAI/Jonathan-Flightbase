/** 좌표값을 정의한 인터페이스 */
export interface Position {
  x: number;
  y: number;
}

/** 도형의 크기를 정의한 인터페이스 */
export interface Size {
  width: number;
  height: number;
}

/** 도형에서 사용하기 위한 좌표값을 정의한 Interface */
export interface Coordinate extends Position {
  id: number;
  x: number;
  y: number;
  annotation_id?: number;
}

/** Rect를 다루기 위해 좌표를 정의한 Interface */
export interface RectPosition extends Position, Size {
  x: number;
  y: number;
  width: number;
  height: number;
  annotation_id?: number;
  id?: number;
  ids?: number[];
}

/** SVG에 대한 D3 Selection을 정의한 타입 */
export type D3_SVG_SELECTION = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

/** DIV#Container에 대한 D3 Selection을 정의한 타입 */
export type DOM_DIV_SELECTION = HTMLDivElement;

/** SVG 내부의 Image에 대한 D3 Selection을 정의한 타입 */
export type D3_IMAGE_SELECTION = d3.Selection<SVGImageElement, unknown, HTMLElement, any>

export type Mode = {
  ready: boolean;
  active: boolean;
}

export type D3_Line_Selection = d3.Selection<
  SVGLineElement,
  unknown,
  HTMLElement,
  any
>;

export type Axis = D3_Line_Selection | undefined;

export type CrossLine = {
  xAxis: Axis;
  yAxis: Axis;
}