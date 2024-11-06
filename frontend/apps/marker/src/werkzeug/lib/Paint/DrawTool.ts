import * as d3 from 'd3';
import Paintor from "./Paintor";
import Atelier from "./Atelier";
import { cloneDeep, /*debounce*/ } from 'lodash';
import { Annotation, Label } from "@src/werkzeug/defs/annotation";
import { Classes } from "@src/werkzeug/defs/classes";
import { Position, RectPosition, Coordinate, Mode } from "@src/werkzeug/defs/draw";
import { checkPropery, getRectSize, resetAnno } from "@src/werkzeug/lib/Util";
import { MARKER_PAINT_IMAGE_CLASS } from "@src/werkzeug/defs/constance";

type DMode = {
  type: 0|1|2; // 0:none, 1:rect, 2:polygon
  ready: boolean;
  active: boolean;
}

type D3_Polygon =  d3.Selection<d3.BaseType, Array<Position>, SVGSVGElement, unknown> | d3.Selection<SVGPolygonElement, Array<Position>, SVGSVGElement, unknown>;
type D3_Rect = d3.Selection<d3.BaseType, RectPosition, SVGSVGElement, unknown> | d3.Selection<SVGRectElement, RectPosition, SVGSVGElement, unknown> | d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
type SelectDot = d3.Selection<SVGCircleElement, unknown, null, undefined>
type LineType = "row" | "col";

type AnnoSize = {
  type: 'rect'|'poly';
  fid: number;
  size: number;
}

export default class DrawTool {
  /* DEFINE : External Reference Variable --------------------------------------------------------------------------- */
  /** @extern */
  private readonly paint:Paintor|undefined = undefined;
  /** @extern */
  private selectedClass:Classes|undefined = undefined;
  /** @extern */
  private selectedAnno:Annotation|undefined = undefined;
  /** @extern */
  private setSelectedAnno:Function = () => {};
  /** @extern */
  private labelList:Array<Label> = [];
  /** @extern */
  private setLabelList:Function = () => {};
  /** @extern */
  private shapeModify:Mode|undefined = undefined;
  /** @extern */
  private setShapeModify:Function = () => {};
  /** @extern */
  private addLabelLog:Function = () => {};
  /** @extern */
  private editLabelLog:Function = () => {};
  /** @extern */
  private deleteLabelLog:Function = () => {};
  /* --------------------------------------------------------------------------- DEFINE : External Reference Variable */



  /* DEFINE : Internal Reference Variable --------------------------------------------------------------------------- */
  /** @intern */
  private drawMode:DMode = { type:0, ready: false, active: false };
  /** @intern */
  private selectionMode:Mode = { ready: false, active:false };
  /** @intern */
  private dragMode:Mode = { ready: false, active: false };
  /** @intern */
  private seperator:number = -1;
  /** @intern */
  private selectDot:SelectDot|undefined = undefined;
  /** @intern */
  private annoSizeList:Array<AnnoSize> = [];
  private prevMousePos:Position|undefined = undefined;
  /* --------------------------------------------------------------------------- DEFINE : Internal Reference Variable */



  /* DEFINE : Drawing Reference Variable ---------------------------------------------------------------------------- */
  /** @drawing */
  private drawingRect:RectPosition|undefined = undefined;
  /** @drawing */
  private startPosition:Position|undefined = undefined;
  /** @drawing */
  private selectLinePod:Position|undefined = undefined;
  /** @drawing */
  private selectLineType:LineType|undefined = undefined;
  /** @drawing */
  private drawingPoly:Array<Coordinate> = [];
  /* ---------------------------------------------------------------------------- DEFINE : Drawing Reference Variable */



  /* CONSTRUCTION AREA ---------------------------------------------------------------------------------------------- */
  constructor(paint:Paintor) {
    this.paint = paint;
  }

  /** @construction 현재 저장된 Labels를 순회하며 도형을 set하는 메소드 */
  public circuitAnnotation() {
    this.__renderingShape();
    this.__sortBySize();
  }

  private __renderingShape() {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg) return;

    for (let i = 0; i < this.labelList.length; i++) {
      const label = this.labelList[i];

      if(label.annotation.length > 0) {
        for (let j = 0; j < label.annotation.length; j++) {
          const anno = label.annotation[j];

          if(label.type === 1) {
            const rect = Atelier.rendRect(anno.coordinates, `rect_${ anno.id }`, this.paint.svg, this.paint.svgScale, anno.color, anno.visibility);
            this.__rectEventBinding(rect, anno.classId, anno.id);
          }
          else if(label.type === 2) {
            const polygon = Atelier.rendPolygon(anno.coordinates, `poly_${ anno.id }`, this.paint.svg, this.paint.svgScale, anno.color, anno.visibility);
            this.__polygonEventBinding(polygon, anno.classId, anno.id);
          }

          if(anno.id === this.selectedAnno?.id) {
            Atelier.rendDot('dot_edit', this.paint.svg, this.paint.svgScale, anno.visibility);
            Atelier.rendLine('line_edit', this.paint.svg, this.paint.svgScale, anno.visibility);
          }
        }
      }
    }

    if(this.drawMode.active && this.drawMode.type === 2 && this.drawingPoly.length > 0) {
      Atelier.rescaleAll('polyline', this.paint.svg, this.paint.svgScale)
    }
  }

  private __sortBySize() {
    if(!this.paint) return;

    this.annoSizeList = [];

    for (let i = 0; i < this.labelList.length; i++) {
      const label = this.labelList[i];

      if(label.annotation.length > 0) {
        for (let j = 0; j < label.annotation.length; j++) {
          const anno = label.annotation[j];

          const size:AnnoSize = {
            type: (anno.type === 1) ? 'rect' : 'poly',
            fid: anno.id,
            size: getRectSize(anno.coordinates)
          }

          this.annoSizeList.push(size);
        }
      }
    }

    this.annoSizeList.sort((a, b) => (
      (a.size < b.size) ? 1 : -1
    ));

    for (let i = 0; i < this.annoSizeList.length; i++) {
      const anno = this.annoSizeList[i];
      const tag = (anno.type === 'rect') ? 'rect' : 'polygon';
      this.paint.svg.select(`${tag}#${anno.type}_${anno.fid}`).raise();
    }

    this.__raise();
  }
  /* ---------------------------------------------------------------------------------------------- CONSTRUCTION AREA */



  /* METHOD : Mode Controller --------------------------------------------------------------------------------------- */
  /** @modeset 그리기 모드를 초기화하는 메소드 */
  public setClearDrawMode() {
    // 만약에 그리는 도중에 모드를 변경하면 그리고 있던 건 삭제
    if(this.drawMode.active) {
      if(!!this.drawingRect) {
        Atelier.removeRect(`rect_${this.seperator}`, this.paint!.svg);
        this.drawingRect = undefined;
      }
      if(this.drawingPoly.length > 0) {
        Atelier.removePolyline(`poly_${this.seperator}`, this.paint!.svg);
        Atelier.removePolygon(`poly_${this.seperator}`, this.paint!.svg);
        Atelier.removeDot(`dot_first`, this.paint!.svg);
        this.drawingPoly = [];
      }
    }

    this.__resetSelectedAnno();

    this.drawMode.ready = false;
    this.drawMode.active = false;
    this.drawMode.type = 0;
  }

  /** @modeset 그리기 모드를 설정하는 메소드 */
  public setOnDrawMode(type:1|2) {
    if(!this.drawMode.ready) {
      this.drawMode.ready = true;
      this.drawMode.type = type;
    }
  }

  /** @modeset 그리기 모드를 활성화하는 메소드 */
  public setEnableDrawMode() {
    if(this.drawMode.ready) {
      this.drawMode.active = true;
    }
  }

  /** @modeset 그리기 모드를 비활성화하는 메소드 */
  public setDisableDrawMode() {
    if(this.drawMode.active) {
      this.drawMode.active = false;
    }
  }

  /** @modeset 선택 모드를 초기화하는 메소드 */
  public setClearSelectMode() {
    // 만약에 수정하는 도중에 모드를 변경하면 변경 중인 내용 저장
    if((this.selectionMode.active || this.dragMode.active)) {
      if(!!this.drawingRect) { // rect인 경우
        this.__modifyLabels(Atelier.rectToPos(this.drawingRect));
      }
      if(this.drawingPoly.length > 0) { // polygon인 경우
        this.__modifyLabels(cloneDeep(this.drawingPoly));
      }

      this.selectDot = undefined;
      this.drawingRect = undefined;
      this.startPosition = undefined;
      this.selectLineType = undefined;
      this.selectLinePod = undefined;
      this.drawingPoly = [];
    }

    this.selectionMode.ready = false;
    this.selectionMode.active = false;
    this.dragMode.ready = false;
    this.dragMode.active = false;
    this.prevMousePos = undefined;
    this.setSelectedAnno(undefined);
  }

  /** @modeset 선택 모드를 설정하는 메소드 */
  public setOnSelectMode() {
    if(!this.selectionMode.ready) {
      this.selectionMode.ready = true;
    }
  }

  /** @modeset 선택 모드를 활성화하는 메소드 */
  public setEnableSelectMode() {
    if(this.selectionMode.ready) {
      this.selectionMode.active = true;
    }
  }

  /** @modeset 선택 모드를 비활성화하는 메소드 */
  public setDisableSelectMode() {
    if(this.selectionMode.active) {
      this.selectionMode.active = false;
    }
  }

  /** @modeset 드래그 모드를 설정하는 메소드 */
  private __setOnDragMode() {
    if(!this.dragMode.ready) {
      this.dragMode.ready = true;
    }
  }

  /** @modeset 드래그 모드를 취소하는 메소드 */
  private __setOffDragMode() {
    if(this.dragMode.ready) {
      this.dragMode.ready = false;
    }
  }

  /** @modeset 드래그 모드를 활성화하는 메소드 */
  private __setEnableDragMode() {
    if(this.dragMode.ready) {
      this.dragMode.active = true;
    }
  }

  /** @modeset 드래그 모드를 비활성화하는 모드 */
  private __setDisableDragMode() {
    if(this.dragMode.active) {
      this.dragMode.active = false;
      this.prevMousePos = undefined;
    }
  }
  /* --------------------------------------------------------------------------------------- METHOD : Mode Controller */



  /* METHOD : useRecoilState ---------------------------------------------------------------------------------------- */
  /** @recoil */
  public useSelectedClass(selectedClass:Classes|undefined) {
    this.selectedClass = cloneDeep(selectedClass);

    this.__effectSelectClass();
  }

  /** @recoil */
  public useSelectedAnno(selectedAnno:Annotation|undefined, setSelectedAnno:Function) {
    this.selectedAnno = cloneDeep(selectedAnno);
    this.setSelectedAnno = setSelectedAnno;

    this.__effectSelectAnno();
  }

  /** @recoil */
  public useLabelList(labelList:Array<Label>, setLabelList:Function) {
    this.labelList = cloneDeep(labelList);
    this.setLabelList = setLabelList;

    this.circuitAnnotation();
  }

  /** @recoil */
  public useShapeModfiy(shapeModify:Mode, setShapeModify:Function) {
    this.shapeModify = shapeModify;
    this.setShapeModify = setShapeModify;
  }

  public useLabelLog(addLabelLog:Function, editLabelLog:Function, deleteLabelLog:Function) {
    this.addLabelLog = addLabelLog;
    this.editLabelLog = editLabelLog;
    this.deleteLabelLog = deleteLabelLog;
  }

  /** @sideEffect Annotation을 선택했을 때 발생하는 side-effect */
  private __effectSelectAnno() {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg) return;
    this.__removeLineDot();

    if(!!this.selectedAnno) {
      if(this.selectedAnno.type === 1) { // 선택된 annotation이 rect일 때
        const line = Atelier.createLine(this.selectedAnno.coordinates, 'line_edit', this.paint.svg, this.paint.svgScale);
        this.__modifyRectLineEventBinding(line);

        const dot = Atelier.createDot(this.selectedAnno.coordinates, 'dot_edit', this.paint.svg, this.selectedAnno.color, this.paint.svgScale, undefined);
        this.__modifyRectDotEventBinding(dot);
      }
      else { // 선택된 annotation이 polygon일 때
        const dot = Atelier.createDot(this.selectedAnno.coordinates, 'dot_edit', this.paint.svg, this.selectedAnno.color, this.paint.svgScale, 'move');
        this.__modifyPolyDotEventBinding(dot);
      }
    }
  }

  /** @sideEffect Class를 선택했을 때 발생하는 side-effect */
  private __effectSelectClass() {
    if (!this.selectedClass || this.selectedClass.id === this.selectedAnno?.classId) {
      this.__resetSelectedAnno();
    }
  }
  /* ---------------------------------------------------------------------------------------- METHOD : useRecoilState */



  /* METHOD : Common Use -------------------------------------------------------------------------------------------- */
  private __appendLabel(coordinates:Array<Coordinate>) {
    /* @optionalBinding */ if(!this.selectedClass || !this.drawMode.type) return;

    const anno:Annotation = {
      classId: this.selectedClass.id,
      className: this.selectedClass.name,
      color: this.selectedClass.color,
      coordinates: cloneDeep(coordinates),
      id: this.seperator,
      issue: '',
      properties: [],
      type: (this.drawMode.type === 1) ? 1 : 2,
      visibility: true,
      status: 0
    }

    if(checkPropery(this.selectedClass)) { // 속성이 있는 경우
      anno.add = true;
      this.setSelectedAnno(cloneDeep(anno));
    }
    else { // 속성이 없는 경우
      anno.add = false;
      const cid = this.labelList.findIndex(v => v.classId === anno.classId);
      if(cid === -1) return;
      this.labelList[cid].annotation.push(anno);
      this.setLabelList(cloneDeep(this.labelList));
      this.addLabelLog(anno)
    }
  }

  /** @common 선택한 annotation을 삭제하는 메소드 */
  private __dropLabels() {
    /* @optionalBinding */ if(!this.selectedAnno || !this.paint || !this.paint.svg) return;

    const selectedAnno = cloneDeep(this.selectedAnno);
    Atelier.removeRect(`rect_${selectedAnno.id}`, this.paint.svg);
    Atelier.removePolygon(`poly_${selectedAnno.id}`, this.paint.svg);

    const cid = this.labelList.findIndex(v => v.classId === selectedAnno?.classId);
    if(cid === -1) return;
    const aid = this.labelList[cid].annotation.findIndex(v => v.id === selectedAnno?.id);
    if(aid === -1) return;
    this.labelList[cid].annotation.splice(aid, 1);

    this.setLabelList(cloneDeep(this.labelList));
  }

  /** @common 선택한 도형을 삭제하는 메소드 */
  private __deleteFigure() {
    /* @optionalBinding */ if(!this.selectedAnno) return;

    this.__removeLineDot();
    this.__dropLabels();

    if(this.selectionMode.ready) this.setDisableSelectMode();
    this.deleteLabelLog(this.selectedAnno.id);

    this.setSelectedAnno(undefined);
  }

  /** coordinates를 가져와 labels을 수정하는 메소드 */
  private __modifyLabels(coordinates:Array<Coordinate>) {
    /* @optionalBinding */ if(!this.selectedAnno || !this.selectionMode.ready) return;

    const anno:Annotation = {
      classId: this.selectedAnno.classId,
      className: this.selectedAnno.className,
      color: this.selectedAnno.color,
      coordinates: cloneDeep(coordinates),
      id: this.selectedAnno.id,
      issue: this.selectedAnno.issue,
      properties: this.selectedAnno.properties,
      type: this.selectedAnno.type,
      visibility: this.selectedAnno.visibility,
      status: 0
    }

    const cid = this.labelList.findIndex(v => v.classId === anno.classId);
    if(cid === -1) return;
    const aid = this.labelList[cid].annotation.findIndex(v => v.id === anno.id);
    if(aid === -1) return;
    this.labelList[cid].annotation[aid] = anno;

    this.editLabelLog(anno, 'coordinates');
    this.setLabelList(cloneDeep(this.labelList))
  }

  private __modifyLabelsOnAdding(coordinates:Array<Coordinate>) {
    /* @optionalBinding */ if(!this.selectedAnno) return;

    const anno:Annotation = {
      classId: this.selectedAnno.classId,
      className: this.selectedAnno.className,
      color: this.selectedAnno.color,
      coordinates: cloneDeep(coordinates),
      id: this.selectedAnno.id,
      issue: '',
      properties: [],
      type: (this.drawMode.type === 1) ? 1 : 2,
      visibility: true,
      status: 0,
      add: true,
    }
    this.setSelectedAnno(anno);
  }

  /** @common selectedAnno의 정보를 이용해 this.labels에 저장된 데이터를 가져오는 메소드 */
  private __getAnnotation() {
    /* @optionalBinding */ if(!this.selectedAnno) return;

    const cid = this.labelList.findIndex(v => v.classId === this.selectedAnno?.classId);

    if(cid === -1) return undefined;
    return this.labelList[cid].annotation.find(v => v.id === this.selectedAnno?.id);
  }

  /** @common 조건에 해당하는 annotation을 labels에서 탐색하는 메소드 */
  private __searchAnno(classId:number, figureId:number) {
    const cId = this.labelList.findIndex(v => v.classId === classId);

    if(cId === -1) return undefined;
    return this.labelList[cId].annotation.find(v => v.id === figureId);
  }

  /** @common 입력받은 rect에 이벤트를 추가하는 메소드 */
  private __rectEventBinding(rect:D3_Rect, classId:number, figureId:number) {
    rect.on('mouseenter', () => {
      if(this.selectionMode.ready) {
        this.__setOnDragMode();
      }
    })

    rect.on('mouseleave', () => {
      if(this.selectionMode.ready) {
        this.__setOffDragMode();
      }
    })

    rect.on('mouseup', (e) => {
      if(e.button !== 0) return;

      if(this.selectedAnno?.id === figureId) {
        if(this.shapeModify?.ready || this.shapeModify?.active) {
          this.setShapeModify({ ready: false, active: false });
        }
      }

      if(this.selectionMode.ready) {
        const anno = this.__searchAnno(classId, figureId);
        this.setSelectedAnno(cloneDeep(anno));
      }
    })

    rect.on('mousedown', (e) => {
      if(e.button !== 0) return;

      if(this.selectedAnno?.id === figureId) {
        this.__raise(rect);

        if(this.selectedAnno.add === true) { // 새
          this.dragMode.ready = true;
          this.dragMode.active = true;
        }
        else {
          this.__setEnableDragMode();
        }

        if(this.shapeModify?.active === false) {
          this.setShapeModify((cur:any) => ({ ...cur, active:true }));
        }
      }
    })
  }

  /** @common 입력받은 Polygon에 이벤트를 추가하는 메소드 */
  private __polygonEventBinding(polygon:D3_Polygon, classId:number, figureId:number) {
    polygon.on('mouseup', (e) => {
      if(e.button !== 0) return;

      if(this.selectionMode.ready) {
        this.__raise(polygon);

        const anno = this.__searchAnno(classId, figureId);
        this.setSelectedAnno(cloneDeep(anno));
      }
    });
  }

  /** @common 수정점과 수정선을 모두 제거하는 메소드 */
  private __removeLineDot() {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg) return;

    Atelier.removeDot('dot_edit', this.paint.svg);
    Atelier.removeLine('line_edit', this.paint.svg);
  }

  /** @common 선택한 도형과 수정점이 최상위로 끌어올려지도록 수정하는 메소드 */
  private __raise(figure?:D3_Rect|D3_Polygon) {
    if(figure !== undefined) {
      figure.raise();
    }

    d3.selectAll('line.line_edit').raise();
    d3.selectAll('circle.dot_edit').raise();
    d3.selectAll('image._marker_issue').raise();
  }

  /** @common 그리는 중에 현재 위치가 첫번째 점과 가까운지 확인하기 위한 메소드 */
  private __maybeStartPosition(e:MouseEvent, first:Position):boolean {
    /* @optionalBinding */ if(!this.paint) return true;

    const current = { x:e.offsetX, y:e.offsetY };
    const near_by = Atelier.NEAR_BY * (1 / this.paint.svgScale);

    const isNearX = Math.abs(first.x - current.x) < near_by;
    const isNearY = Math.abs(first.y - current.y) < near_by;

    return isNearX && isNearY;
  }

  private __resetSelectedAnno() {
    if(resetAnno(this.selectedAnno)) {
      this.setSelectedAnno(undefined);
    }
  }

  private __isClickImage(e:MouseEvent) {
    const targetClass = (e.target as HTMLElement).classList[0];
    return (targetClass === MARKER_PAINT_IMAGE_CLASS)
  }

  // private __checkButton(e:MouseEvent) {
  //   console.log(e.button); // 0:좌클릭, 1:휠클릭, 2:우클릭
  // }
  /* -------------------------------------------------------------------------------------------- METHOD : Common Use */



  /* METHOD : Event Binding ----------------------------------------------------------------------------------------- */
  /** mousedown 이벤트 발생 시 조건에 따라 그림을 그리도록 유도하는 메소드 */
  public bindMousedownForDraw(e:MouseEvent) {
    // this.__checkButton(e);
    if(this.drawMode.ready) { // 그리기 모드일 때
      if(this.selectedAnno?.add !== true || this.__isClickImage(e)) {
        this.__resetSelectedAnno();
        if(this.drawMode.type === 1) { // 선택된 도구가 Rect일 때
          this.__onStartRectDrawing(e);
        }
      }
    }
    else if(this.selectionMode.ready) {
      if(this.selectedAnno !== undefined && this.__isClickImage(e)) {
        this.setSelectedAnno(undefined)
      }
    }
  }

  /** mousemove 이벤트 발생 시 그림을 그리는 분기점 메소드 */
  public bindMousemoveForDraw(e:MouseEvent) {
    if(this.drawMode.active) { // 그리기 중일 때
      if(this.drawMode.type === 1) { // 선택된 도구가 Rect일 때
        this.__onRunRectDrawing(e);
      }
      else if(this.drawMode.type === 2) { // 선택된 도구가 Polygon일 때
        this.__onFlowPolyDrawing(e);
      }
    }
  }

  /** mouseup 이벤트 발생 시 그림을 그리는 분기점 메소드 */
  public bindMouseupForDraw(e:MouseEvent) {
    if(this.drawMode.ready) { // 그리기 모드가 선택되어 있고
      // this.__resetSelectedAnno();
      // if(this.selectedAnno?.add === true) return;

      if(this.drawMode.active) { // 그리기 중일 때
        if(this.drawMode.type === 1) { // 선택된 도구가 Rect일 때
          this.__onStopRectDrawing(e);
        }
        else if(this.drawMode.type === 2) { // 선택된 도구가 Polygon일 때
          if(!this.__maybeStartPosition(e, this.drawingPoly[0])) { // 첫번째 점이 아니라면
            this.__onRunPolyDrawing(e); // 그냥 그리기
          }
          else { // 첫번째 점이라면
            this.__onStopPolyDrawing() // 그리기 종료
          }
        }
      }
      else { // 그리는 중이 아닐 때
        if(this.drawMode.type === 2) { // 선택된 도구가 Polygon일 때
          if(this.selectedAnno?.add !== true) {
            this.__onStartPolyDrawing(e); // 그리기 시작
          }
        }
      }
    }
  }

  /** mouseup 이벤트 발생 시 Dot를 통해 Rect를 수정하기 위한 분기점 메소드 */
  public bindMouseupForModifyDot() {
    if(this.selectionMode.active && !!this.selectDot) { // 수정점을 선택 중일 때
      this.setDisableSelectMode();

      if(this.selectedAnno?.type === 1) { // 선택된 도형이 Rect일 때
        if(this.drawingRect) { // 수정이 이루어졌을 때
          this.__modifyLabels(Atelier.rectToPos(this.drawingRect))
          this.setSelectedAnno(cloneDeep(this.__getAnnotation()));
        }

        this.selectDot = undefined;
        this.drawingRect = undefined;
        this.startPosition = undefined;
      }
      else if(this.selectedAnno?.type === 2 && !!this.selectDot) { // 선택된 도형이 polygon일 때
        if(this.drawingPoly.length > 0) {
          this.__modifyLabels(cloneDeep(this.drawingPoly));
          this.setSelectedAnno(cloneDeep(this.__getAnnotation()));
        }

        this.selectDot = undefined;
        this.drawingPoly = [];
      }
    }
    else if(this.selectedAnno?.add === true && !!this.selectDot) { // 현재 작성중인 어노테이션을 수정하는 경우
      if(this.selectedAnno.type === 1) { // 선택된 도형이 Rect일 때
        if(this.drawingRect) { // 수정이 이루어졌을 때
          this.__modifyLabelsOnAdding(Atelier.rectToPos(this.drawingRect));
        }

        this.selectDot = undefined;
        this.drawingRect = undefined;
        this.startPosition = undefined;
      }
      else if(this.selectedAnno.type === 2) { // 선택된 도형이 polygon일 때
        if(this.drawingPoly.length > 0) { // 수정이 이루어졌을 때
          this.__modifyLabelsOnAdding(this.drawingPoly);
        }

        this.selectDot = undefined;
        this.drawingPoly = [];
      }
    }
  }

  /** mousemove 이벤트 발생 시 Dot를 통해 Rect를 수정하기 위한 분기점 메소드 */
  public bindMousemoveForModifyDot(e:MouseEvent) {
    if(this.selectionMode.active && !!this.selectDot) { // 수정점을 선택 중일 때
      if(!this.selectedAnno) return;

      if(this.selectedAnno.type === 1) { // 선택된 도형이 Rect일 때
        if(!!this.startPosition) { // 수정이 이루어졌다면
          this.drawingRect = this.__getRectPosition(this.startPosition, e);
          this.__updateRect();
        }
      }
      else if(this.selectedAnno.type === 2) { // 선택된 도형이 polygon일 때
        this.__updatePolygon(e);
      }
    }
    else if(this.selectedAnno?.add === true && !!this.selectDot) { // 현재 작성중인 어노테이션을 수정하는 경우
      if(this.selectedAnno.type === 1 && !!this.startPosition) { // 선택된 도형이 Rect일 때
        this.drawingRect = this.__getRectPosition(this.startPosition, e);
        this.__updateRect();
      }
      else if(this.selectedAnno.type === 2) { // 선택된 도형이 Polygon일 때
        this.__updatePolygon(e);
      }
    }
  }

  /** mouseup 이벤트 발생 시, Line을 통해 Rect를 수정하기 위한 분기점 메소드 */
  public bindMouseupForModifyRectLine() {
    if(this.selectedAnno?.type === 1) { // Rect일 때
      if(this.selectionMode.active && !!this.selectLinePod) { // 수정선을 선택 중일 때
        this.setDisableSelectMode();

        if (!!this.drawingRect) { // 수정이 이루어졌다면
          this.__modifyLabels(Atelier.rectToPos(this.drawingRect));
          this.setSelectedAnno(cloneDeep(this.__getAnnotation()));
        }

        this.selectLineType = undefined;
        this.startPosition = undefined;
        this.selectLinePod = undefined;
        this.drawingRect = undefined;
      }
      else if(this.selectedAnno?.add === true && !!this.selectLinePod) { // 현재 작성중인 어노테이션을 수정하는 경우
        if(!!this.drawingRect) { // 수정이 이루어졌다면
          this.__modifyLabelsOnAdding(Atelier.rectToPos(this.drawingRect));
        }

        this.selectLineType = undefined;
        this.startPosition = undefined;
        this.selectLinePod = undefined;
        this.drawingRect = undefined;
      }
    }
  }

  /** mousemove 이벤트 발생 시, Line을 통해 Rect를 수정하기 위한 분기점 메소드 */
  public bindMousemoveForModifyRectLine(e:MouseEvent) {
    if(this.selectedAnno?.type === 1) {
      if(this.selectionMode.active || this.selectedAnno.add === true) { // 수정선을 선택중일 때
        /* @optionalBinding */ if(!this.selectLinePod || !this.selectLineType || !this.startPosition) return;

        this.drawingRect = this.__getRectObjectInLine(this.selectLinePod, this.startPosition, e, this.selectLineType);
        this.__updateRect();
      }
    }
  }

  /** Backspace keyup 이벤트 발생 시 분기점 메소드 */
  public bindKeyupByBackspace() {
    // Polygon 그리기 툴일 때
    if(this.drawMode.active && this.drawMode.type === 2) {
      this.__popPointOnDrawing(); // 마지막 polygon point 제거
    }
    else if(!!this.selectedAnno /*&& this.selectionMode.ready*/) { // 특정 어노테이션이 선택되어있을 때
      this.__deleteFigure(); //
      this.drawingRect = undefined; // rect를 삭제
      this.drawingPoly = []; // polygon을 삭제
    }
  }

  /** mouseup 이벤트 발생 시, 도형의 위치를 이동시키기 위한 분기점 메소드 */
  public bindMouseupForMove() {
    if(this.dragMode.active && !!this.selectedAnno) { // 특정 어노테이션이 선택되어 있을 때
      this.__setDisableDragMode();

      if(this.selectedAnno.type === 1 && !!this.drawingRect) { // 선택된 도형이 Rect일 때
        if(this.selectedAnno.add === true) { // 새로 생성된 어노테이션을 수정하는 경우
          this.__modifyLabelsOnAdding(Atelier.rectToPos(this.drawingRect));

          this.dragMode.ready = false;
          this.dragMode.active = false;
        }
        else { // 기존에 생성된 어노테이션을 수정하는 경우
          this.__modifyLabels(Atelier.rectToPos(this.drawingRect));
          this.setSelectedAnno(cloneDeep(this.__getAnnotation()));
        }
        this.drawingRect = undefined;
      }
    }
  }

  /** mousemove 이벤트 발생 시, 도형의 위치를 이동시키기 위한 분기점 메소드 */
  public bindMousemoveForMove(e:MouseEvent) {
    if(this.dragMode.active && !!this.selectedAnno) { // 특정 어노테이션이 선택되어 이동중일 때
      if(this.selectedAnno.type === 1) { // 그게 Rect라면

        this.drawingRect = this.__getMovementRectObject(e);
        this.__updateRect()
      }
    }
  }
  /* ----------------------------------------------------------------------------------------- METHOD : Event Binding */



  /* METHOD : Draw Rect --------------------------------------------------------------------------------------------- */
  /** Rect를 그리기 시작할 때 동작하는 메소드 */
  private __onStartRectDrawing(e:MouseEvent) {
    /* @optionalBinding */ if(!this.selectedClass || !this.paint || !this.paint.svg) return;
    this.setEnableDrawMode();

    const { offsetX:x, offsetY:y } = e;
    const color = this.selectedClass.color;
    const svg = this.paint.svg;
    const scale = this.paint.svgScale;
    const first:RectPosition = { x, y, width:0, height:0 };
    this.startPosition = first;

    Atelier.rendRect(first, `rect_${this.seperator}`, svg, scale, color)
  }

  /** Rect를 그리는 도중의 메소드 */
  private __onRunRectDrawing(e:MouseEvent) {
    /* @optionalBinding */ if(!this.startPosition || !this.paint || !this.paint.svg) return;

    const svg = this.paint.svg;
    this.drawingRect = this.__getRectPosition(this.startPosition, e);

    Atelier.drawRect(this.drawingRect, `rect_${this.seperator}`, svg);
  }

  /** Rect 그리기를 멈췄을 때의 메소드 */
  private __onStopRectDrawing(e:MouseEvent) {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg || !this.selectedClass || !this.startPosition) return;
    this.setDisableDrawMode();

    if(!this.__maybeStartPosition(e, this.startPosition) && !!this.drawingRect) {
      // 첫 점보다 먼 경우
      const rect = this.paint.svg.select(`rect#rect_${this.seperator}`);
      this.__rectEventBinding(rect, this.selectedClass.id, this.seperator);

      // add to label
      // this.appendLabels(Atelier.rectToPos(rect.datum() as RectPosition));
      // this.__appendLabelMiddleware(Atelier.rectToPos(rect.datum() as RectPosition));
      this.__appendLabel(Atelier.rectToPos(rect.datum() as RectPosition));

      this.seperator--;
    }
    else {
      // 멀지 않은 경우
      Atelier.removeRect(`rect_${this.seperator}`, this.paint.svg)
    }

    this.drawingRect = undefined;
  }

  /** 기준점과 현재 마우스의 위치를 비교해 rect position을 return하는 메소드 */
  private __getRectPosition(standard:Position, e:MouseEvent):RectPosition {
    const { offsetX:x, offsetY:y } = e;
    return {
      x: standard.x < x ? standard.x:x,
      y: standard.y < y ? standard.y:y,
      width: Math.abs(x - standard.x),
      height: Math.abs(y - standard.y)
    };
  }
  /* --------------------------------------------------------------------------------------------- METHOD : Draw Rect */



  /* METHOD : Modify Rect ------------------------------------------------------------------------------------------- */
  /** Rect의 수정점 Circle에 이벤트를 추가하는 메소드 */
  private __modifyRectDotEventBinding(dots: d3.Selection<SVGCircleElement, Position, SVGSVGElement, unknown>) {
    /* @optionalBinding */ if(!this.selectedAnno) return;

    /** 수정점의 대척점을 구하는 메소드 */
    const getAntipod = (i:number) => {
      const { id } = this.selectedAnno!.coordinates[0];
      const aId = id + ((i + 2) % 4);
      return this.selectedAnno!.coordinates.find(v => v.id === aId)
    }

    const nodes = dots.nodes();

    for (let i = 0; i < nodes.length; i++) {
      const dot = d3.select(nodes[i]);

      dot.on('mouseenter', () => {
        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.ready === false) {
            this.setShapeModify((cur:any) => ({ ...cur, ready:true }));
          }
        }
      })

      dot.on('mousedown', (e) => {
        if(e.button !== 0) return;

        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.ready === true) {
            this.setShapeModify((cur:any) => ({ ...cur, active:true }));
          }

          this.startPosition = getAntipod(i);
          this.selectDot = dot;
          if(this.selectionMode.ready) this.setEnableSelectMode();
        }
      });

      dot.on('mouseleave', () => {
        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.active !== true) {
            this.setShapeModify((cur:any) => ({ ...cur, ready:false }));
          }
        }
      })

      dot.on('mouseup', (e) => {
        if(e.button !== 0) return;

        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.active === true) {
            this.setShapeModify({ ready: false, active: false });
          }
        }
      });
    }
  }

  /** Rect의 수정선 Line에 이벤트를 추가하는 메소드 */
  private __modifyRectLineEventBinding(lines: d3.Selection<d3.BaseType, unknown, SVGSVGElement, unknown>) {
    /* @optionalBinding */ if(!this.selectedAnno) return;

    /* Line 선택시 기준점을 구하기 위한 이벤트 핸들러 */
    const getpod = (i:number) => {
      const id = i % 3 === 0 ? 0:2;
      return this.selectedAnno!.coordinates[id];
    }

    /* Line 선택 시 대척점을 구하기 위한 이벤트 핸들러 */
    const getAntipod = (i:number) => {
      const id = i % 3 === 0 ? 2:0;
      return this.selectedAnno!.coordinates[id];
    }

    const nodes = lines.nodes();

    for (let i = 0; i < nodes.length; i++) {
      const line = d3.select(nodes[i]);

      line.on('mouseenter', () => {
        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.ready === false) {
            this.setShapeModify((cur:any) => ({ ...cur, ready:true }));
          }
        }
      })

      line.on('mousedown', (e) => {
        if(e.button !== 0) return;

        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.ready === true) {
            this.setShapeModify((cur:any) => ({ ...cur, active:true }));
          }

          this.selectLineType = i % 2 === 0 ? 'row':'col';
          this.selectLinePod = getpod(i);
          this.startPosition = getAntipod(i);
          if(this.selectionMode.ready) this.setEnableSelectMode();
        }
      });

      line.on('mouseleave', () => {
        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.active !== true) {
            this.setShapeModify((cur:any) => ({ ...cur, ready:false }));
          }
        }
      })

      line.on('mouseup', (e) => {
        if(e.button !== 0) return;

        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.active === true) {
            this.setShapeModify({ ready: false, active: false });
          }
        }
      })
    }
  }

  /**
   * 수정점과 수정선을 수정하는 위치에 따라 재조정하는 메소드
   * @modifyRect
   */
  private __updateRect() {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg) return;

    if(!!this.selectedAnno && this.selectedAnno.type === 1 && !!this.drawingRect) {
      Atelier.drawRect(this.drawingRect, `rect_${this.selectedAnno.id}`, this.paint.svg);
      Atelier.redrawDot(this.drawingRect, 'dot_edit', this.paint.svg);
      Atelier.redrawLine(this.drawingRect, 'line_edit', this.paint.svg);
    }
  }

  /** Line 조정 시 기준점과 대척점, 현재 마우스의 위치를 비교해 RectPosion을 return하는 메소드 */
  private __getRectObjectInLine(
    linepod: Position,
    antipod: Position,
    e: MouseEvent,
    lineType: 'col' | 'row',
  ):RectPosition {
    const { offsetX: x, offsetY: y } = e;
    const rect: RectPosition = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    if (lineType === 'col') {
      // x, width
      rect.x = antipod.x < x ? antipod.x : x;
      rect.y = linepod.y < antipod.y ? linepod.y : antipod.y;
      rect.width = Math.abs(x - antipod.x);
      rect.height = Math.abs(linepod.y - antipod.y);
    } else {
      // y, height
      rect.x = linepod.x < antipod.x ? linepod.x : antipod.x;
      rect.y = antipod.y < y ? antipod.y : y;
      rect.width = Math.abs(linepod.x - antipod.x);
      rect.height = Math.abs(y - antipod.y);
    }

    return rect;
  }

  private __getMouseMovement(e: MouseEvent) {
    const { offsetX:x, offsetY:y } = e;

    if(!this.prevMousePos) {
      this.prevMousePos = { x, y };
    }

    const mx = x - this.prevMousePos.x;
    const my = y - this.prevMousePos.y;

    this.prevMousePos = { x, y };

    return { x: mx, y: my }
  }

  /** Mouse의 이동한 정도에 따라 Rect를 이동시키는 메소드 */
  private __getMovementRectObject(e: MouseEvent) {
    /* @optionalBinding */ if(!this.selectedAnno || !this.paint || !this.paint.svg) return;
    const { width:mxx, height:mxy } = this.paint.originalImageSize;

    const { x, y } = this.__getMouseMovement(e);
    const datum = (this.paint.svg.select(`rect#rect_${this.selectedAnno.id}`).datum() as RectPosition);

    const rectX = (() => {
      const X = datum.x + x;
      const abx = (X < 0) ? 0 : X;
      const w = datum.width;
      if(abx+w > mxx) return mxx - w;
      else            return abx;
    })();
    const rectY = (() => {
      const Y = datum.y + y;
      const aby = (Y < 0) ? 0 : Y;
      const h = datum.height;

      if(aby+h > mxy) return mxy - h;
      else            return aby;
    })()

    const rect: RectPosition = {
      x: rectX,
      y: rectY,
      width: datum.width,
      height: datum.height
    };

    return rect;
  }
  /* ------------------------------------------------------------------------------------------- METHOD : Modify Rect */



  /* METHOD : Draw Polygon ------------------------------------------------------------------------------------------ */
  /** Polygon을 그리기 시작할 때의 메소드 */
  private __onStartPolyDrawing(e:MouseEvent) {
    /* @optionalBinding */ if(!this.selectedClass || !this.paint || !this.paint.svg) return;
    this.setEnableDrawMode();

    const { offsetX:x, offsetY:y } = e;
    this.drawingPoly.push({id:0, x, y})

    const id = `poly_${this.seperator}`;
    const svg = this.paint.svg;
    const scale = this.paint.svgScale;
    const color = this.selectedClass.color;

    Atelier.createPolyline(this.drawingPoly, id, svg, scale, color);
  }

  /** Polygon을 그리고 있을 때, mouse 이동 시 임시로 그려지게 하는 메소드 */
  private __onFlowPolyDrawing(e:MouseEvent) {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg || !this.selectedClass) return;
    // 임시로 polyline을 표현하기 위한 위치값
    const temp = (() => {
      if(this.__maybeStartPosition(e, this.drawingPoly[0]) && this.drawingPoly.length > 2) {
        // 첫번째 점에 가깝다면 첫번째 점의 위치를 return
        return this.drawingPoly[0]
      }
      else { // 아니라면 현재 mouse의 위치를 return
        return { id: this.drawingPoly.length, x: e.offsetX, y: e.offsetY };
      }
    })();

    // polyline을 임시로 그려내는 로직
    const id = `poly_${this.seperator}`;
    const svg = this.paint.svg;
    Atelier.drawPolyline(this.drawingPoly.concat([temp]), id, svg);

    if(this.__maybeStartPosition(e, this.drawingPoly[0]) && this.drawingPoly.length > 2) {
      // 첫번째 점에 가깝다면 dot를 만든다
      Atelier.createDot([this.drawingPoly[0]], 'dot_first', this.paint.svg, this.selectedClass.color, this.paint.svgScale, 'default');
    }
    else {
      // 아니라면 해당 dot를 삭제
      Atelier.removeDot('dot_first', this.paint.svg)
    }
  }

  /** Polygon을 그리고 있을 때 mouseUp시 point를 추가하는 메소드 */
  private __onRunPolyDrawing(e:MouseEvent) {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg) return;

    const { offsetX:x, offsetY:y } = e;
    this.drawingPoly.push({id:this.drawingPoly.length, x, y});

    const id = `poly_${this.seperator}`;
    const svg = this.paint.svg;
    Atelier.drawPolyline(this.drawingPoly, id, svg);
  }

  /** Polygon을 그리고 있을 때, 첫번째 점 근처에서 mouseup시 polyline을 삭제하고 polygon을 생성하는 메소드 */
  private __onStopPolyDrawing() {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg || !this.selectedClass) return;
    this.setDisableDrawMode();

    Atelier.removePolyline(`poly_${this.seperator}`, this.paint.svg);
    Atelier.removeDot(`dot_first`, this.paint.svg);

    if(this.drawingPoly.length > 2) {
      // point가 3개 이상인 경우에 저장
      const id = `poly_${this.seperator}`;
      const svg = this.paint.svg;
      const scale = this.paint.svgScale;
      const color = this.selectedClass.color;

      const polygon = Atelier.rendPolygon(this.drawingPoly, id, svg, scale, color);
      this.__polygonEventBinding(polygon, this.selectedClass.id, this.seperator);

      // this.appendLabels(this.drawingPoly);
      // this.__appendLabelMiddleware(this.drawingPoly);
      this.__appendLabel(this.drawingPoly);

      this.seperator--;
    }

    this.drawingPoly = [];
  }

  /** Polygon을 그리고 있을때 backspace 하면, 마지막 점부터 차례로 삭제시키는 메소드 */
  private __popPointOnDrawing() {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg || this.drawingPoly.length === 0) return;

    this.drawingPoly.pop();
    const id = `poly_${this.seperator}`;
    const svg = this.paint.svg;
    if(this.drawingPoly.length > 0) {
      Atelier.drawPolyline(this.drawingPoly, id, svg);
    }
    else {
      this.setDisableDrawMode();
      Atelier.removePolyline(id, svg);
    }
  }
  /* ------------------------------------------------------------------------------------------ METHOD : Draw Polygon */



  /* METHOD : Modify Polygon ---------------------------------------------------------------------------------------- */
  /** Polygon의 수정점 Circle에 이벤트를 추가하는 메소드 */
  private __modifyPolyDotEventBinding(dots: d3.Selection<SVGCircleElement, Position, SVGSVGElement, unknown>) {
    /* @optionalBinding */ if(!this.selectedAnno) return;
    const nodes = dots.nodes();

    for (let i = 0; i < nodes.length; i++) {
      const dot = d3.select(nodes[i]);

      dot.on('mouseenter', () => {
        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.ready === false) {
            this.setShapeModify((cur:any) => ({ ...cur, ready:true }));
          }
        }
      });

      dot.on('mousedown', (e) => {
        if(e.button !== 0) return;

        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.ready === true) {
            this.setShapeModify((cur:any) => ({ ...cur, active:true }));
          }

          this.selectDot = dot;
          if(this.selectionMode.ready) this.setEnableSelectMode();
        }
      });

      dot.on('mouseleave', () => {
        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.active !== true) {
            this.setShapeModify((cur:any) => ({ ...cur, ready:false }));
          }
        }
      });

      dot.on('mouseup', (e) => {
        if(e.button !== 0) return;

        if(this.selectionMode.ready || this.selectedAnno?.add === true) {
          if(this.shapeModify?.active === true) {
            this.setShapeModify({ ready: false, active: false });
          }
        }
      });
    }
  }

  /** Polygon의 수정점 circle을 이동시키는 메소드 */
  private __updatePolygon(e:MouseEvent) {
    /* @optionalBinding */ if(!this.selectDot || !this.selectedAnno || !this.paint || !this.paint.svg) return;
    const { offsetX:x, offsetY:y } = e;
    this.selectDot.attr('cx', x).attr('cy', y);
    const D = (this.selectDot.datum() as Coordinate);

    this.drawingPoly = cloneDeep(this.selectedAnno.coordinates);
    const _dot = this.drawingPoly.find(v => v.id === D.id)!;
    _dot.x = x;
    _dot.y = y;

    Atelier.drawPolygon(this.drawingPoly, `poly_${this.selectedAnno.id}`, this.paint.svg);
  }
  /* ---------------------------------------------------------------------------------------- METHOD : Modify Polygon */
}