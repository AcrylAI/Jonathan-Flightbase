import { D3_SVG_SELECTION, Position, RectPosition, Size } from "@src/werkzeug/defs/draw";
import { Random } from "@src/werkzeug/lib/Util";
import * as d3 from "d3";
import { Coordinatum } from "@src/werkzeug/defs/annotation";

/**
 * D3를 통해 SVG 내부의 도형을 다루기 위한 Static Class
 * @author Dawson
 * @version 22-12-05
 */
export default class Atelier {
  /* DEFINE : Internal Referance Variable Area ---------------------------------------------------------------------- */
  public static readonly STROKE_WIDTH = 2;
  public static readonly NEAR_BY = 10;
  /* ---------------------------------------------------------------------- DEFINE : Internal Referance Variable Area */



  /* METHOD : Rect Area --------------------------------------------------------------------------------------------- */
  /** 입력된 position에 따라 rect를 생성하거나 다시 그리기 위한 메소드 */
  public static rendRect(
    position: RectPosition|Array<Position>,
    id: string,
    svg: D3_SVG_SELECTION,
    scale = 1,
    color = Random.color(),
    visible = true,
  ) {
    const _position = (() => {
      if(Array.isArray(position)) return this.posToRect(position);
      else return position;
    })();

    if(!svg.selectAll(`rect#${id}`).node()) {
      return svg.selectAll(`rect#${id}`)
                .data([_position])
                .enter()
                .append('rect')
                .attr('id', id)
                .attr('class', 'marker-shape')
                .attr('x', d => Math.abs(d.x))
                .attr('y', d => Math.abs(d.y))
                .attr('width', d => Math.abs(d.width))
                .attr('height', d => Math.abs(d.height))
                .attr('stroke-width', this.STROKE_WIDTH * (1/scale))
                .attr('stroke', color)
                .attr('fill', color)
                .attr('fill-opacity', 0.2)
                .attr('visibility', visible ? 'visible':'hidden')
                .attr('vector-effect', 'non-scaling-stroke');
    }
    else {
      return svg.selectAll(`rect#${id}`)
                .data([_position])
                .attr('x', d => Math.abs(d.x))
                .attr('y', d => Math.abs(d.y))
                .attr('width', d => Math.abs(d.width))
                .attr('height', d => Math.abs(d.height))
                .attr('stroke-width', this.STROKE_WIDTH * (1/scale))
                .attr('stroke', color)
                .attr('fill', color)
                .attr('visibility', visible ? 'visible':'hidden');
    }
  }

  /** Rect의 좌표값을 지속적으로 수정하는 함수 */
  public static drawRect(
    position: RectPosition|Position[],
    id: string,
    svg: D3_SVG_SELECTION
  ) {
    const _position = (() => {
      if(Array.isArray(position)) return this.posToRect(position);
      else return position;
    })();

    svg
      .select(`rect#${id}`)
      .data([_position])
      .attr('x', d => Math.abs(d.x))
      .attr('y', d => Math.abs(d.y))
      .attr('width', d => Math.abs(d.width))
      .attr('height', d => Math.abs(d.height));
  }

  /** id 값으로 Rect를 삭제하는 메소드 */
  public static removeRect(id: string, svg: D3_SVG_SELECTION) {
    svg.select(`rect#${id}`).remove();
  }
  /* --------------------------------------------------------------------------------------------- METHOD : Rect Area */



  /* METHOD : Polygon Area ------------------------------------------------------------------------------------------ */
  /** 입력된 position에 따라 polygon을 생성하거나 다시 그리기 위한 메소드 */
  public static rendPolygon(
    position: Position[],
    id: string,
    svg: D3_SVG_SELECTION,
    scale = 1,
    color = Random.color(),
    visible = true
  ) {
    if(!svg.selectAll(`polygon#${id}`).node()) {
      return svg
        .selectAll(`polygon#${id}`)
        .data([position])
        .enter()
        .append('polygon')
        .attr('id', id)
        .attr('class', 'marker-shape')
        .attr('points', d =>
          d.map((v) => [Math.abs(v.x), Math.abs(v.y)].join(',')).join(' '),
        )
        .attr('stroke-width', this.STROKE_WIDTH * (1 / scale))
        .attr('stroke', color)
        .attr('fill', color)
        .attr('fill-opacity', 0.2)
        .attr('visibility', visible ? 'visible':'hidden')
        .attr('vector-effect', 'non-scaling-stroke');
    }
    else {
      return svg
        .selectAll(`polygon#${id}`)
        .data([position])
        .attr('points', d =>
          d.map((v) => [Math.abs(v.x), Math.abs(v.y)].join(',')).join(' '),
        )
        .attr('stroke-width', this.STROKE_WIDTH * (1 / scale))
        .attr('stroke', color)
        .attr('fill', color)
        .attr('visibility', visible ? 'visible':'hidden');
    }
  }

  /** Polygon을 수정하는 d3 함수 */
  public static drawPolygon(
    position: Position[],
    id: string,
    svg: D3_SVG_SELECTION,
  ) {
    const points = position.map(d => [Math.abs(d.x), Math.abs(d.y)].join(',')).join(' ');

    svg.select(`polygon#${id}`).data([position]).attr('points', points);
  }

  /** Polygon을 삭제하는 d3 함수 */
  public static removePolygon(id: string, svg: D3_SVG_SELECTION) {
    svg.select(`polygon#${id}`).remove();
  }

  /** Polyline을 생성하는 d3 함수 */
  public static createPolyline(
    position: Position[],
    id: string,
    svg: D3_SVG_SELECTION,
    scale = 1,
    color: string,
  ) {
    svg
      .selectAll(`polyline#${id}`)
      .data([position])
      .enter()
      .append('polyline')
      .attr('id', id)
      .attr('points', d =>
        d.map((v) => [Math.abs(v.x), Math.abs(v.y)].join(',')).join(' '),
      )
      .attr('stroke-width', this.STROKE_WIDTH * (1 / scale))
      .attr('stroke', color)
      .attr('fill', color)
      .attr('fill-opacity', 0);
  }

  /** Polyline의 points를 추가하는 함수 */
  public static drawPolyline(
    position: Position[],
    id: string,
    svg: D3_SVG_SELECTION,
  ) {
    const points = position.map(d => [Math.abs(d.x), Math.abs(d.y)].join(',')).join(' ');

    svg.select(`polyline#${id}`).data([position]).attr('points', points);
  }

  /** Polyline을 제거하는 함수 */
  public static removePolyline(id: string, svg: D3_SVG_SELECTION) {
    svg.select(`polyline#${id}`).remove();
  }
  /* ------------------------------------------------------------------------------------------ METHOD : Polygon Area */



  /* METHOD : Dot Area ---------------------------------------------------------------------------------------------- */
  /** Circle을 그리는 메소드 */
  public static createDot(
    position: Position[],
    id: string,
    svg: D3_SVG_SELECTION,
    color: string,
    scale = 1,
    cursor: string | undefined = undefined,
  ) {
    return svg
      .selectAll(`circle.${id}`)
      .data(position)
      .enter()
      .append('circle')
      .attr('class', `${id}`)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', (6 / scale))
      .attr('fill', 'white')
      .attr('stroke', color)
      .attr('stroke-width', (1 / scale))
      .attr('data-testid', 'moveCircle')
      .style('cursor', setCursor);

    function setCursor(d: any, i: number) {
      if (!cursor) {
        return (i % 2 === 0)
          ? `url("/static/cursor/cursor_nwse-resize.png") 9 9, auto`
          : `url("/static/cursor/cursor_nesw-resize.png") 9 9, auto`;
      }
      return cursor;
    }
  }

  /** 사각형의 크기 변경시 해당 좌표의 위치에 따라 Dot를 조정하는 함수 */
  public static redrawDot(
    position: Position[]|RectPosition,
    id: string,
    svg: D3_SVG_SELECTION,
  ) {
    const nodes = svg.selectAll(`circle.${id}`).nodes();

    const _position = (() => {
      if (Array.isArray(position)) return position;
      else return this.rectToPos(position);
    })();

    for (let i = 0; i < _position.length; i++) {
      const dot = d3.select(nodes[i]);

      dot
        .datum(_position[i])
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
    }
  }

  /** Circle을 제거하는 함수 */
  public static removeDot(id: string, svg: D3_SVG_SELECTION) {
    svg.selectAll(`circle.${id}`).remove();
  }

  /** 단일 Circle을 수정하는 함수 */
  public static rendDot(
    id: string,
    svg: D3_SVG_SELECTION,
    scale = 1,
    visibility:boolean = true,
  ) {
    // const near = this.NEAR_BY * (1 / scale);

    svg
      .selectAll(`circle.${id}`)
      .attr('r', (6 / scale))
      .attr('stroke-width', (1 / scale))
      .attr('visibility', visibility ? 'visible':'hidden');
  }
  /* ---------------------------------------------------------------------------------------------- METHOD : Dot Area */



  /* METHOD : Line Area --------------------------------------------------------------------------------------------- */
  /** Line을 그리는 함수 */
  public static createLine(
    position: Position[],
    id: string,
    svg: D3_SVG_SELECTION,
    scale = 1,
    cursor: string | undefined = undefined,
  ) {
    const near = this.NEAR_BY * (1 / scale);

    for (let i = 0; i < position.length; i++) {
      const start = position[i];
      const end = position[(i + 1) % 4];

      svg
        .append('line')
        .datum({ start, end })
        .attr('class', `${id}`)
        .attr('x1', d => d.start.x)
        .attr('y1', d => d.start.y)
        .attr('x2', d => d.end.x)
        .attr('y2', d => d.end.y)
        .attr('stroke', 'rgba(0,0,0,0)')
        .attr('stroke-width', near)
        .style('cursor', setCursor(i));
    }

    return svg.selectAll(`line.${id}`);

    /**
     * 위치에 따라 Cursor의 상태를 다르게 하기 위한 함수
     * @param i - 현재 Line의 순번
     */
    function setCursor(i: number) {
      if (!cursor) {
        return (i % 2 === 0)
          ?`url("/static/cursor/cursor_ns-resize.png") 6 10.5, auto`
          :`url("/static/cursor/cursor_ew-resize.png") 10.5 6, auto`;
      }
      return cursor;
    }
  }

  /** 사각형의 크기 변경시 해당 좌표의 위치에 따라 Line을 조정하는 함수 */
  public static redrawLine(
    position: Position[]|RectPosition,
    id: string,
    svg: D3_SVG_SELECTION,
  ) {
    const nodes = svg.selectAll(`line.${id}`).nodes();

    const _position = (() => {
      if (Array.isArray(position)) return position;
      else return this.rectToPos(position);
    })();

    for (let i = 0; i < _position.length; i++) {
      const line = d3.select(nodes[i]);
      const start = _position[i];
      const end = _position[(i + 1) % 4];

      line
        .datum({ start, end })
        .attr('x1', (d) => d.start.x)
        .attr('y1', (d) => d.start.y)
        .attr('x2', (d) => d.end.x)
        .attr('y2', (d) => d.end.y);
    }
  }

  /** Line을 삭제하는 함수 */
  public static removeLine(id: string, svg: D3_SVG_SELECTION) {
    svg.selectAll(`line.${id}`).remove();
  }

  /** 단일 Line을 수정하는 함수 */
  public static rendLine(
    id: string,
    svg: D3_SVG_SELECTION,
    scale = 1,
    visibility: boolean = true,
  ) {
    const near = this.NEAR_BY * (1 / scale);

    svg.selectAll(`line.${id}`)
       .attr('stroke-width', near)
       .attr('visibility', visibility ? 'visible':'hidden')
  }
  /* --------------------------------------------------------------------------------------------- METHOD : Line Area */
  
  
  
  /* METHOD : Image Area -------------------------------------------------------------------------------------------- */
  /** Issue와 관련된 이미지를 생성하는 메소드 */
  public static rendImage(
    position:Position,
    id:string,
    svg:D3_SVG_SELECTION,
    imageSize:Size,
    scale:number=1,
    alert=false,
  ) {
    const S = 32 * (1/scale);
    const url = (() => {
      if(alert) return '/static/issue_alert.svg';
      else      return '/static/issue_normal.svg';
    })();

    const X = (d:Position) => {
      const P = 4 * (1/scale);
      if(d.x > P) {
        if(imageSize.width > 0 && d.x + S > imageSize.width) return imageSize.width - S;
        else return d.x - P;
      }
      return 0
    }

    const Y = (d:Position) => {
      const P = 20 * (1/scale);
      if(d.y > P) {
        if(imageSize.height > 0 && d.y + S > imageSize.height) return imageSize.height - S;
        else return d.y - P
      }
      return 0;
    }

    if(!svg.selectAll(`image#${id}`).node()) { // case:Craete
      return svg.selectAll(`image#${id}`)
                .data([position])
                .enter()
                .append('image')
                .attr('id', id)
                .attr('class', '_marker_issue')
                .attr('href', url)
                .attr('x', X)
                .attr('y', Y)
                .attr('width', S)
                .attr('height', S);
    }
    else { // case:re-Rend
      return svg.selectAll(`image#${id}`)
                .data([position])
                .attr('href', url)
                .attr('x', X)
                .attr('y', Y)
                .attr('width', S)
                .attr('height', S);
    }
  }

  public static removeImage(id:string, svg:D3_SVG_SELECTION) {
    svg.selectAll(`image#${id}`).remove();
  }
  /* -------------------------------------------------------------------------------------------- METHOD : Image Area */



  /* METHOD : Common ------------------------------------------------------------------------------------------------ */
  /** 입력된 ICoordinate[]에서 RectPosition에서 사용할 x, y, width, height를 추출해 return */
  public static posToRect(coordinates: Array<Position>):RectPosition {
    const minX = d3.min(coordinates, (d) => d.x) as number;
    const maxX = d3.max(coordinates, (d) => d.x) as number;
    const minY = d3.min(coordinates, (d) => d.y) as number;
    const maxY = d3.max(coordinates, (d) => d.y) as number;
    const width = maxX - minX;
    const height = maxY - minY;

    return {
      x: minX,
      y: minY,
      width,
      height,
    };
  }

  /** 입력된 RectPosition을 2,1,4,3 사분면 순서대로 output에 담아 return */
  public static rectToPos(rectPos: RectPosition):Coordinatum[] {
    // 입력된 RectPosition을 2,1,4,3 사분면 순서대로 output에 담아 return
    const output: Coordinatum[] = [];

    const { x, y, width, height } = rectPos;
    output.push({ x, y, id:0 }); // 2사분면의 점
    output.push({ x: x + width, y, id:1 }); // 1사분면의 점
    output.push({ x: x + width, y: y + height, id:2 }); // 4사분면의 점
    output.push({ x, y: y + height, id:3 }); // 3사분면의 점

    return output;
  }
  
  /** 선택된 모든 요소의 stroke-width를 재정의하는 함수 */
  public static rescaleAll(
    selector: string,
    svg: D3_SVG_SELECTION,
    currentScale: number,
    stroke_width = this.STROKE_WIDTH,
  ) {
    const selectAll = svg.selectAll(selector).nodes();
    for (const select of selectAll) {
      const scale = 1 / currentScale;
      d3.select(select).attr('stroke-width', stroke_width * scale);
    }
  }
  /* ------------------------------------------------------------------------------------------------ METHOD : Common */
}