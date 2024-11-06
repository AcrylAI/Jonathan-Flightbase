import * as d3 from "d3";
import {
  DOM_DIV_SELECTION,
  D3_IMAGE_SELECTION,
  D3_SVG_SELECTION,
  Position,
  Size,
  Mode,
  CrossLine
} from "@src/werkzeug/defs/draw";
import { Adjustment } from "@src/werkzeug/defs/annotation";
import {
  INT_SCALE_WHEEL,
  MARKER_PAINT_CANVAS_ID,
  MARKER_PAINT_CONTAINER_ID, MARKER_PAINT_CROSSLINE_CLASSNAME, MARKER_PAINT_DRAGMODE_CLASSNAME,
  MARKER_PAINT_IMAGE_CLASS,
  MARKER_PAINT_MOVEMODE_CLASSNAME, MAX_SCALE, MIN_SCALE
} from "@src/werkzeug/defs/constance";
import Atelier from "@src/werkzeug/lib/Paint/Atelier";

// import { checkBrowser } from "@src/werkzeug/lib/Util";
// const BROWSER = checkBrowser();

const strokeWidth = 1.5;

export default class Paintor {
  /* DEFINE : External Reference Variable --------------------------------------------------------------------------- */
  /** Paint Component의 svg를 선택하는 d3 Selector */
  public svg:D3_SVG_SELECTION = d3.select(`svg#${MARKER_PAINT_CANVAS_ID}`);
  /** Paint Component의 div#container를 선택하는 DOM Selector */
  public container:DOM_DIV_SELECTION = document.getElementById(MARKER_PAINT_CONTAINER_ID) as DOM_DIV_SELECTION;
  /** svg > image 태그를 선택하는 d3 Selector */
  public svgImage:D3_IMAGE_SELECTION|undefined = undefined;
  /** api로부터 전송받은 image의 url */
  private readonly imageSrc:string = '';
  private setScale:Function = () => {};
  /* --------------------------------------------------------------------------- DEFINE : External Reference Variable */

  /* DEFINE : Internal Reference Variable --------------------------------------------------------------------------- */
  /** image의 크기를 저장하는 멤버 변수 */
  public originalImageSize:Size = { width:0, height: 0 };
  /** 현재 svg의 확대값 */
  public svgScale: number = 1;
  /** 현재 svg의 position을 저장하는 멤버 변수 */
  public svgPosition:Position = { x:0, y:0 };
  /** 이동하기 이전의 svg position을 저장하는 멤버 변수 */
  public prevPosition:Position|undefined = undefined;
  public useCrossList:boolean = true;
  /* --------------------------------------------------------------------------- DEFINE : Internal Reference Variable */

  /* DEFINE : Hand Tool Related Variable ---------------------------------------------------------------------------- */
  private moveMode:Mode = { ready: false, active: false };
  /* ---------------------------------------------------------------------------- DEFINE : Hand Tool Related Variable */

  /* DEFINE : Cross Line Related Variable --------------------------------------------------------------------------- */
  private crossLine:CrossLine = {
    xAxis: undefined, yAxis: undefined
  }
  /* --------------------------------------------------------------------------- DEFINE : Cross Line Related Variable */



  /* CONSTRUCTION AREA ---------------------------------------------------------------------------------------------- */
  constructor(imageSrc:string, isViewer=false) {
    this.svg = d3.select(`svg#${MARKER_PAINT_CANVAS_ID}`);
    this.container = document.getElementById(MARKER_PAINT_CONTAINER_ID) as DOM_DIV_SELECTION;
    this.imageSrc = imageSrc;
    this.useCrossList = !isViewer;

    this.__clear();
    this.__setImage();
    this.__setOriginalImageSize();
  }

  private __clear() {
    this.svg.selectAll('*').remove();
  }

  /** svg에 이미지를 넣는 메서드 */
  private __setImage() {
    this.svg.selectAll('image').remove();

    this.svgImage = this.svg
                        .append('image')
                        .attr('class', MARKER_PAINT_IMAGE_CLASS)
                        .attr('xlink:href', this.imageSrc);
  }

  /** originalImageSize 세팅하는 메서드 */
  private __setOriginalImageSize() {
    const img = new Image();
    img.crossOrigin = 'annonymous';

    img.src = this.imageSrc;

    img.onload = () => {
      const { width, height } = img;

      this.svg
          .attr('width', width)
          .attr('height', height);

      this.originalImageSize = { width, height };

      this.adjustImageSize(true);

      if(this.useCrossList) {
        this.__crateCrossLine();
      }
    };
  }

  public useScaleAtom(setScale:Function) {
    this.setScale = setScale;
  }
  /* ---------------------------------------------------------------------------------------------- CONSTRUCTION AREA */



  /* METHOD AREA : Mode Controller ---------------------------------------------------------------------------------- */
  /** svg 이동 준비 */
  public setClearMode() {
    if(this.moveMode.ready) {
      this.moveMode.ready = false;
      this.moveMode.active = false;
      this.prevPosition = undefined;
      this.container.classList.remove(MARKER_PAINT_MOVEMODE_CLASSNAME, MARKER_PAINT_DRAGMODE_CLASSNAME);
    }
  }

  /** svg 이동 활성화 */
  public setOnMoveMode() {
    if(!this.moveMode.ready) {
      this.moveMode.ready = true;
      this.container.classList.add(MARKER_PAINT_MOVEMODE_CLASSNAME);
    }
  }

  /** svg 이동 활성화 */
  public setEnableMoveMode() {
    if(this.moveMode.ready) {
      this.moveMode.active = true;
      this.container.classList.replace(MARKER_PAINT_MOVEMODE_CLASSNAME, MARKER_PAINT_DRAGMODE_CLASSNAME);
    }
  }

  /** svg 이동 비활성화 */
  public setDisableMoveMode() {
    if(this.moveMode.active) {
      this.moveMode.active = false;
      this.prevPosition = undefined;
      this.container.classList.replace(MARKER_PAINT_DRAGMODE_CLASSNAME, MARKER_PAINT_MOVEMODE_CLASSNAME);
    }
  }
  /* ---------------------------------------------------------------------------------- METHOD AREA : Mode Controller */



  /* METHOD AREA : Common ------------------------------------------------------------------------------------------- */
  /** svg의 Image 태그의 크기를 읽어오는 메소드 */
  public getImageSize():Size {
    const { width, height } = this.svgImage?.node()?.getBoundingClientRect() || { width:0, height: 0 };
    return { width, height };
  }

  /** div#container의 크기를 읽어오는 메소드 */
  public getContainerSize():Size {
    const { width, height } = this.container.getBoundingClientRect() || { width:0, height:0 };
    return { width, height };
  }

  /** div#container와 svg>image의 크기를 읽어오는 메서드 */
  public getDivImgSize() {
    const { width: divWidth, height: divHeight } = this.getContainerSize();
    const { width: imgWidth, height: imgHeight } = this.getImageSize();

    return { divWidth, divHeight, imgWidth, imgHeight };
  }

  /** scale값이 반영된 위치값을 반환하는 메소드 */
  public calcSvgPos():Position {
    return {
      x: this.svgPosition.x + ((1 - this.svgScale) * this.originalImageSize.width) / 2,
      y: this.svgPosition.y + ((1 - this.svgScale) * this.originalImageSize.height) / 2
    };
  }

  /** scale값이 반영된 0,0의 위치값을 반환하는 메소드 */
  public calcZeroPos():Position {
    return {
      x: (-(1 - this.svgScale) * this.originalImageSize.width) / 2,
      y: (-(1 - this.svgScale) * this.originalImageSize.height) / 2
    }
  }
  /* ------------------------------------------------------------------------------------------- METHOD AREA : Common */



  /* METHOD AREA : Paint Move --------------------------------------------------------------------------------------- */
  /** svg의 scale, postion을 지정하는 메소드 */
  public adjustImageSize(fit:boolean) {
    this.__adjustSvgPosition(fit);

    this.svg.attr(
      'transform',
      `translate(${ this.svgPosition.x }, ${ this.svgPosition.y }) scale(${ this.svgScale })`,
    );
  }

  /** 이미지가 이상한 곳으로 가지 않도록 계산하는 메소드 */
  private __adjustSvgPosition(fit:boolean) {
    const { divWidth, divHeight, imgWidth, imgHeight } = this.getDivImgSize();

    const zeroPos = this.calcZeroPos();
    const svgPos = this.calcSvgPos();

    let x = null; let y = null;

    if(!fit) {
      // x position
      if(imgWidth < divWidth) {
        if(svgPos.x < 0 && svgPos.x !== 0) {
          x = zeroPos.x;
          y = this.svgPosition.y;
        }
        else if(svgPos.x + imgWidth > divWidth) {
          x = zeroPos.x + divWidth - imgWidth;
          y = this.svgPosition.y;
        }
      }
      else {
        const limit = imgWidth - divWidth;

        if(svgPos.x < -limit) {
          x = zeroPos.x - limit;
          y = this.svgPosition.y;
        }
        else if(svgPos.x > 0) {
          x = zeroPos.x;
          y = this.svgPosition.y;
        }
      }

      // y position
      if (imgHeight < divHeight) {
        if (svgPos.y < 0 && svgPos.y !== 0) {
          x = this.svgPosition.x;
          y = zeroPos.y;
        } else if (svgPos.y + imgHeight > divHeight) {
          x = this.svgPosition.x;
          y = zeroPos.y + divHeight - imgHeight;
        }
      }
      else {
        const limitHeight = imgHeight - divHeight;

        if (svgPos.y < -limitHeight) {
          x = this.svgPosition.x;
          y = zeroPos.y - limitHeight;
        } else if (svgPos.y > 0) {
          x = this.svgPosition.x;
          y = zeroPos.y;
        }
      }
    }
    else {
      const { width:imgWidth, height:imgHeight } = this.originalImageSize;

      const scale = this.svgScale;
      const trueImageWidth = scale * imgWidth;
      const trueImageHeight = scale * imgHeight;

      if(trueImageWidth < divWidth) {
        x = (zeroPos.x + (divWidth - trueImageWidth)/2);
      }
      else {
        x = zeroPos.x;
      }

      if(trueImageHeight < divHeight) {
        y = (zeroPos.y + (divHeight - trueImageHeight)/2);
      }
      else {
        y = zeroPos.y;
      }
    }

    /* @optionalBinding */ if (x === null || y === null) return;
    this.svgPosition = { x, y };
  }

  /** 이미지 이동 이벤트 */
  public imageMoveEvent(e:MouseEvent) {
    /* @optionalBinding */ if(!this.moveMode.active) return;

    const { clientX:x, clientY:y } = e;

    if(!this.prevPosition) {
      this.prevPosition = { x, y };
    }

    const mx = x - this.prevPosition.x;
    const my = y - this.prevPosition.y;

    this.prevPosition = { x, y };

    this.__moveSvg(mx, my);
  }

  /** 실제 svg를 이동시키는 이벤트 */
  private __moveSvg(x:number, y:number) {
    /* @optionalBinding */ if(!this.container || !this.svgImage) return;

    const hasToUpdate = { x:false, y:false };
    const svgPos = this.calcSvgPos();

    const { divWidth, divHeight, imgWidth, imgHeight } = this.getDivImgSize();

    if(this.__isMovable(svgPos.x + x, divWidth, imgWidth)) hasToUpdate.x = true;
    if(this.__isMovable(svgPos.y + y, divHeight, imgHeight)) hasToUpdate.y = true;

    // update Area
    this.svgPosition = {
      x: hasToUpdate.x ? this.svgPosition.x + x : this.svgPosition.x,
      y: hasToUpdate.y ? this.svgPosition.y + y : this.svgPosition.y
    };

    this.adjustImageSize(false);
  }

  /**
   * 이미지가 이동가능한지 확인하는 내부 메소드
   * @param pos - 이동하고자 하는 x축 또는 y축의 위치
   * @param divSize - div의 높이 또는 너비
   * @param imgSize - image의 높이 또는 너비
   * @paintMove
   */
  private __isMovable(pos:number, divSize:number, imgSize:number) {
    if(divSize >= imgSize) {
      if(pos < 0 || pos > divSize - imgSize) return false;
    }
    else {
      if(pos > 0 || divSize - pos > imgSize) return false;
    }

    return true;
  }
  /* --------------------------------------------------------------------------------------- METHOD AREA : Paint Move */

  /* METHOD AREA : Zooming ------------------------------------------------------------------------------------------ */
  public bindMousewheelForZoom(e:WheelEvent) {
    if(e.deltaY > 0) {
      this.__imageReduce();
    }
    else {
      this.__imageEnlarge();
    }

    this.setScale(this.svgScale);
  }

  private __imageEnlarge() {
    if(this.svgScale < MAX_SCALE) {
      const _scale = Math.floor(this.svgScale * 100 / 10) * INT_SCALE_WHEEL;
      this.svgScale = _scale + INT_SCALE_WHEEL;
      // this.adjustImageSize(true);
    }
  }

  private __imageReduce() {
    if(this.svgScale > MIN_SCALE) {
      const _scale = Math.floor(this.svgScale * 100 / 10) * INT_SCALE_WHEEL;
      this.svgScale = ((_scale - INT_SCALE_WHEEL) > 0) ? (_scale - INT_SCALE_WHEEL):(_scale);
      // this.adjustImageSize(true);
    }
  }
  /* ------------------------------------------------------------------------------------------ METHOD AREA : Zooming */

  /* METHOD AREA : Image Adjustment --------------------------------------------------------------------------------- */
  /**
   * 이미지의 설정 값을 변경하는 메소드
   * @param adjustment 인자로 전달받은 adjustment의 값
   */
  public setImageAdjustment(adjustment:Adjustment) {
    const b = adjustment.brightness / 100;
    const c = adjustment.contrast / 100;
    const e = adjustment.saturation / 100;

    this.svgImage?.attr("filter", `brightness(${b}) contrast(${c}) saturate(${e})`);
  }
  /* --------------------------------------------------------------------------------- METHOD AREA : Image Adjustment */

  /* METHOD AREA : Cross Line --------------------------------------------------------------------------------------- */
  /**
   * 이미지에 십자선을 추가하는 메소드
   */
  private __crateCrossLine() {
    const color = '#f41';
    const { width, height } = this.originalImageSize;

    this.svg.selectAll(MARKER_PAINT_CROSSLINE_CLASSNAME).remove();
    const scale = 1 / this.svgScale;

    this.crossLine = {
      xAxis: this.svg
                 .append('line')
                 .attr('class', MARKER_PAINT_CROSSLINE_CLASSNAME)
                 .attr('stroke', color)
                 .attr('stroke-width', strokeWidth * scale)
                 .attr('x1', 0)
                 .attr('x2', width)
                 .attr('y1', width / 2)
                 .attr('y2', width / 2),
      yAxis: this.svg
                 .append('line')
                 .attr('class', MARKER_PAINT_CROSSLINE_CLASSNAME)
                 .attr('stroke', color)
                 .attr('stroke-width', strokeWidth * scale)
                 .attr('x1', height / 2)
                 .attr('x2', height / 2)
                 .attr('y1', 0)
                 .attr('y2', height),
    }
  }
  
  public crossLineMove(e: MouseEvent) {
    if(!this.crossLine.xAxis || !this.crossLine.yAxis) return;
    const padding = (strokeWidth * (1 / this.svgScale))

    const { offsetX, offsetY } = e;
    this.crossLine.xAxis.attr('y1', offsetY+(padding)).attr('y2', offsetY+(padding));
    this.crossLine.yAxis.attr('x1', offsetX+(padding)).attr('x2', offsetX+(padding));
  }

  public rescaleCrossLine() {
    Atelier.rescaleAll(`line.${MARKER_PAINT_CROSSLINE_CLASSNAME}`, this.svg, this.svgScale, strokeWidth);
  }
  /* --------------------------------------------------------------------------------------- METHOD AREA : Cross Line */
}