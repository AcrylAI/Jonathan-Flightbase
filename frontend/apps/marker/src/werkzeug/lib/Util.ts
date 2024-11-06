// import { TouchEvent } from "react";
import * as d3 from "d3";
import {
  AVAILABLECHAR,
  MARKER_PAINT_CANVAS_ID,
  MARKER_PAINT_ISSUEMAKER_TEXTAREA_ID
} from "@src/werkzeug/defs/constance";
import { Classes } from "@src/werkzeug/defs/classes";
import { Coordinate, D3_SVG_SELECTION, Position } from "@src/werkzeug/defs/draw";
import { Annotation, Issue } from "@src/werkzeug/defs/annotation";
import Atelier from "@src/werkzeug/lib/Paint/Atelier";

/**
 * 난수 생성관련 로직을 모아둔 Static Class
 * @author Dawson
 * @version 22-08-02
 */
export class Random {

  /**
   * Random.string의 최대 크기
   */
  private static readonly MAXIMUM = AVAILABLECHAR.length;

  /**
   * 최대 최소값을 받아 난수 생성
   * @param min - 최소값
   * @param max - 최대값
   * @return - min과 max 사이의 number
   */
  public static number(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * 입력받은 lots 만큼의 임의의 문자열을 생성
   * @param length - 임의의 문자열의 길이
   * @return - lots 길이 만큼의 임의의 문자열
   */
  public static string(length: number) {
    const list = this.__getStringArray(length);
    return list
      .map((i) => AVAILABLECHAR[i])
      .join()
      .replaceAll(',', '');
  }

  /**
   * 임의의 색상을 생성
   * @return - 000000 ~ D8D8D8 사이 임의의 color string
   */
  public static color() {
    const r = this.number(0, 27) * 8;
    const g = this.number(0, 27) * 8;
    const b = this.number(0, 27) * 8;

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * _AVAILABLECHAR 배열에 사용할 임의의 index 값을 생성하는 메소드
   * @param lots - argument로부터 전달받은 lots 값
   * @return - _AVAILABLECHAR 배열에 사용할 임의의 index 값
   */
  private static __getStringArray(lots: number) {
    const result: number[] = [];

    for (let i = 0; i < lots; i++) {
      result.push(this.number(0, this.MAXIMUM));
    }

    return result;
  }
}

/**
 * 입력된 숫자값을 K 축약하는 함수
 * @param num 축약할 숫자
 * @author Dawson
 * @version 22-12-05
 */
export function itos(num:number):string {
  const option:Intl.NumberFormatOptions = {
    notation: "compact"
  }

  return new Intl.NumberFormat('en-US', option).format(num);
}

export function checkPropery(classes:Classes):boolean {
  if(classes.property.length > 0) {
    for (let i = 0; i < classes.property.length; i++) {
      const prop = classes.property[i];
      if(prop.options.length === 0) {
        return false
      }
    }
    return true;
  }
  else {
    return false;
  }
}

export function getRectSize(coordinates:Array<Coordinate>):number {
  const min:Position = getMinPos(coordinates);
  const max:Position = getMaxPos(coordinates);

  const width = max.x - min.x;
  const height = max.y - min.y;

  return (width * height);
}

export function getMinPos(coordinates:Array<Coordinate>):Position {
  const {x, y} = splitPos(coordinates);

  return {
    x: Math.min.apply(null, x),
    y: Math.min.apply(null, y)
  }
}

export function getMaxPos(coordinates:Array<Coordinate>):Position {
  const {x, y} = splitPos(coordinates);

  return {
    x: Math.max.apply(null, x),
    y: Math.max.apply(null, y)
  }
}

export function splitPos(coordinates:Array<Coordinate>) {
  let x:number[] = [];
  let y:number[] = [];

  for (let i = 0; i < coordinates.length; i++) {
    x.push(coordinates[i].x);
    y.push(coordinates[i].y);
  }

  return { x, y }
}

export function resetAnno(anno:Annotation|undefined) {
  if(!!anno && anno.add === true) {
    const svg = d3.select(`svg#${MARKER_PAINT_CANVAS_ID}`) as D3_SVG_SELECTION;

    Atelier.removeRect(`rect_${anno.id}`, svg);
    Atelier.removePolyline(`poly_${anno.id}`, svg);
    Atelier.removePolygon(`poly_${anno.id}`, svg);
    Atelier.removeDot(`dot_first`, svg);
    Atelier.removeDot(`dot_edit`, svg);
    Atelier.removeLine(`line_edit`, svg);

    return true;
  }
  return false;
}

export function resetIssue(issue:Issue|undefined) {
  if(!!issue && issue.add == true) {
    const svg = d3.select(`svg#${MARKER_PAINT_CANVAS_ID}`) as D3_SVG_SELECTION;

    Atelier.removeImage(`issue_${issue.id}`, svg);

    return true;
  }
  return false;
}

export function wait(delay:number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function checkBrowser() {
  const useragent = window.navigator.userAgent.toLowerCase();

  switch (true) {
    case useragent.indexOf('edge') > -1: case useragent.indexOf('edg/') > -1: return 'edge';
    case useragent.indexOf('opr') > -1: return 'opera';
    case useragent.indexOf('chrome') > -1: return 'chrome';
    case useragent.indexOf('firefox') > -1: return 'firefox';
    case useragent.indexOf('safari') > -1: return 'safari';
    default: return 'other';
  }
}

export function isFocus() {
  return document.getElementById(MARKER_PAINT_ISSUEMAKER_TEXTAREA_ID)?.classList.contains('focus')
}

export function scrollSmooth(id:string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// export function getOffsetPos(e:TouchEvent):Position {
//   const bcr = (e.target as any).getBoundingClientRect();
//   const x = e.targetTouches[0].clientX - bcr.x;
//   const y = e.targetTouches[0].clientY - bcr.y;
//
//   return { x, y }
// }