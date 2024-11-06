import { Paintor, DrawTool, IssueTool } from "./Paint";
import { Adjustment, Annotation, Issue, Label, Tools } from "@src/werkzeug/defs/annotation";
import { Classes } from "@src/werkzeug/defs/classes";
import { Mode } from "@src/werkzeug/defs/draw";
import { isFocus } from "@src/werkzeug/lib/Util";
import { throttle } from "lodash";
// import { getOffsetPos } from "@src/werkzeug/lib/Util";

export default class DrawManager {
  /* DEFINE : External Reference Variable --------------------------------------------------------------------------- */
  /** @extern */
  private readonly paint:Paintor|undefined = undefined;
  /** @extern */
  private readonly draw:DrawTool|undefined = undefined;
  /** @extern */
  private readonly issue:IssueTool|undefined = undefined;
  /** @extern */
  private readonly canIuse:boolean = false;
  /* --------------------------------------------------------------------------- DEFINE : External Reference Variable */

  /* DEFINE : Internal Reference Variable --------------------------------------------------------------------------- */
  /** @intern */
  private currentTool:Tools = -1;
  /* --------------------------------------------------------------------------- DEFINE : Internal Reference Variable */

  /* CONSTRUCTION AREA ---------------------------------------------------------------------------------------------- */
  constructor(imageSrc:string, canIuse:boolean, isViewer=false) {
    this.paint = new Paintor(imageSrc, isViewer);
    this.draw = new DrawTool(this.paint);
    this.issue = new IssueTool(this.paint, canIuse, isViewer);
    this.canIuse = canIuse;

    this.__bindEvent();
  }
  /* ---------------------------------------------------------------------------------------------- CONSTRUCTION AREA */

  /* METHOD AREA : useRecoilState ----------------------------------------------------------------------------------- */
  public useSelectedClassAtom(selectedClass:Classes|undefined) {
    /* @optionalBinding */ if(!this.draw) return;
    this.draw.useSelectedClass(selectedClass);
  }

  public useSelectedAnnoAtom(selectedAnno:Annotation|undefined, setSelectedAnno:Function) {
    /* @optionalBinding */ if(!this.draw) return;
    this.draw.useSelectedAnno(selectedAnno, setSelectedAnno);
  }

  public useLabelListAtom(labelList:Array<Label>, setLabelList:Function) {
    /* @optionalBinding */ if(!this.draw) return;
    this.draw.useLabelList(labelList, setLabelList);
  }

  public useShapeModifyAtom(shapeModify:Mode, setShapeModfiy:Function) {
    /* @optionalBinding */ if(!this.draw) return;
    this.draw.useShapeModfiy(shapeModify, setShapeModfiy);
  }

  public useLabelLogSelector(addLabelLog:Function, editLabelLog:Function, deleteLabelLog:Function) {
    /* @optionalBinding */ if(!this.draw) return;
    this.draw.useLabelLog(addLabelLog, editLabelLog, deleteLabelLog);
  }

  public useIssueListAtom(issueList:Array<Issue>, setIssueList:Function) {
    if(!this.issue) return;
    this.issue.useIssueList(issueList, setIssueList);
  }

  public useSelectedIssueAtom(selectedIssue:Issue|undefined, setSelectedIssue:Function) {
    if(!this.issue) return;
    this.issue.useSelectedIssue(selectedIssue, setSelectedIssue);
  }

  // public useSelectedToolAtom(selectedTool:Tools) {
  //   if(!this.issue) return;
  //   this.issue.useSelectedTool(selectedTool);
  // }

  public useIssueLogSelector(deleteIssueLog:Function) {
    if(!this.issue) return;
    this.issue.useIssueLog(deleteIssueLog);
  }

  public useScaleAtom(setScale:Function) {
    if(!this.paint) return;
    this.paint?.useScaleAtom(setScale);
  }
  /* ----------------------------------------------------------------------------------- METHOD AREA : useRecoilState */

  /* METHOD AREA : Mode Change -------------------------------------------------------------------------------------- */
  get tool() {
    return this.currentTool;
  }

  set tool(tool:Tools) {
    this.currentTool = tool;

    if(!!this.issue) {
      this.issue.useSelectedTool(tool);
    }

    this.__sanitizeModes();
    switch (this.currentTool) {
      case 0: // Selection Tool
        this.draw?.setOnSelectMode();
        this.issue?.setOnSelectMode();
        return;
      case 1: // Hand Tool
        this.paint?.setOnMoveMode();
        return;
      case 3: // BBox
        this.draw?.setOnDrawMode(1);
        return;
      case 4: // Polygon
        this.draw?.setOnDrawMode(2);
        return;
      case 5: // Issue
        this.issue?.setOnIssueMode();
        return;
      default:
        return;
    }
  }

  private __sanitizeModes() {
    this.paint?.setClearMode();
    this.draw?.setClearDrawMode();
    this.draw?.setClearSelectMode();
    this.issue?.setClearIssueMode();
    this.issue?.setClearSelectMode();
  }
  /* -------------------------------------------------------------------------------------- METHOD AREA : Mode Change */

  /* METHOD AREA : Event Binding ------------------------------------------------------------------------------------ */
  private __bindEvent() {
    /* @optionalBinding */ if(!this.paint) return;

    /* ---------- Paint > Container Event Binding Area ---------- */
    this.paint.container.addEventListener('mouseleave', (e) => {
      this.paint?.setDisableMoveMode();
    })

    this.paint.container.addEventListener('mousedown', () => {
      this.paint?.setEnableMoveMode();
    })

    this.paint.container.addEventListener('mouseup', () => {
      this.paint?.setDisableMoveMode();

      if(this.currentTool === 1) {
        this.issue?.circuitIssue();
        this.issue?.casingHandToolMove();
      }
    })


    /* ---------- Paint > Svg Event Binding Area ---------- */
    this.paint.svg.on('mousedown', e => {
      // 0:좌클릭, 1:가운데, 2:우클릭
      if(e.button !== 0) return;

      if(this.canIuse) {
        this.draw?.bindMousedownForDraw(e);
      }
    })
    this.paint.svg.on('mousemove', e => {
      this.paint?.imageMoveEvent(e);
      if(this.canIuse) {
        this.draw?.bindMousemoveForDraw(e);
        this.draw?.bindMousemoveForModifyDot(e);
        this.draw?.bindMousemoveForModifyRectLine(e);
        this.draw?.bindMousemoveForMove(e);
      }
      this.paint?.crossLineMove(e);
    })
    this.paint.svg.on('mouseup', e => {
      if(e.button !== 0) return;

      if(this.canIuse) {
        this.draw?.bindMouseupForDraw(e);
        this.draw?.bindMouseupForModifyDot();
        this.draw?.bindMouseupForModifyRectLine();
        this.draw?.bindMouseupForMove();
        this.issue?.bindMouseupForIssue(e);
      }
    })

    const throtteldZooming = throttle((e:WheelEvent) => {
      this.paint?.bindMousewheelForZoom(e);
    }, 50)

    this.paint.svg.on('mousewheel', e => {
      e.stopPropagation();
      e.preventDefault();

      throtteldZooming(e)
    })

    this.paint.svg.on('mouseleave', e => {
      if(e.button !== 0) return;

      if(this.canIuse) {
        if(this.currentTool === 3) this.draw?.bindMouseupForDraw(e);
        this.draw?.bindMouseupForModifyDot();
        this.draw?.bindMouseupForModifyRectLine();
        this.draw?.bindMouseupForMove();
      }
    })


    /* ---------- Document Event Binding Area ---------- */
    document.addEventListener('keyup', e => {
      if(isFocus()) return;

      const { key, /*altKey, metaKey, ctrlKey, shiftKey*/ } = e;

      if(this.canIuse) {
        switch (key) {
          case 'Backspace':
            e.preventDefault();
            this.draw?.bindKeyupByBackspace();
            this.issue?.bindKeyupByBackspace();
            break;
          default:
            break;
        }
      }
    })
  }
  /* ------------------------------------------------------------------------------------ METHOD AREA : Event Binding */

  /* METHOD AREA : Zoom --------------------------------------------------------------------------------------------- */
  public zooming(scale:number) {
    /* @optionalBinding */ if(!this.paint) return;

    // const fit = (() => {
    //   if(((scale * 100) % 25) !== 0) {
    //     return true
    //   }
    //   else {
    //     switch (scale) {
    //       case 0.5: return true;
    //       case 1: return true;
    //       case 2: return true;
    //       default:
    //         return false;
    //     }
    //   }
    // })();

    this.paint.svgScale = scale;
    this.paint.adjustImageSize(true);
    this.paint.rescaleCrossLine();

    this.draw?.circuitAnnotation();
    this.issue?.circuitIssue();
    this.issue?.casingHandToolMove();
  }
  /* --------------------------------------------------------------------------------------------- METHOD AREA : Zoom */

  /* METHOD AREA : Adjustment --------------------------------------------------------------------------------------- */
  public setAdjustment(adjustment:Adjustment) {
    /* @optionalBiding */ if(!this.paint) return;

    this.paint.setImageAdjustment(adjustment);
  }
  /* --------------------------------------------------------------------------------------- METHOD AREA : Adjustment */
}