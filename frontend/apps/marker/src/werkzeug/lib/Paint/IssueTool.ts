import { cloneDeep } from "lodash";
import * as d3 from 'd3';
import Paintor from "./Paintor";
import Atelier from "./Atelier";
import { Position } from "@src/werkzeug/defs/draw";
import { Issue, Tools } from "@src/werkzeug/defs/annotation";
import { MARKER_PAINT_ISSUEMAKER_TEXTAREA_ID, MARKER_PAINT_ISSUEMODE_CLASSNAME } from "@src/werkzeug/defs/constance";
import { resetIssue } from "@src/werkzeug/lib/Util";

type D3_Issue = d3.Selection<d3.BaseType, Position, SVGSVGElement, unknown> | d3.Selection<SVGImageElement, Position, SVGSVGElement, unknown>;

export default class IssueTool {
  /* DEFINE : External Reference Variable --------------------------------------------------------------------------- */
  /** @extern */
  private readonly paint:Paintor|undefined = undefined;
  /** @extern */
  private issueList:Array<Issue> = [];
  /** @extern */
  private setIssueList:Function = () => {};
  /** @extern */
  private selectedIssue:Issue|undefined = undefined;
  /** @extern */
  private setSelectedIssue:Function = () => {};
  /** @extern */
  private selectedTool:Tools = -1;
  /** @extern */
  private deleteIssueLog:Function = () => {};
  /* --------------------------------------------------------------------------- DEFINE : External Reference Variable */

  /* DEFINE : Internal Reference Variable --------------------------------------------------------------------------- */
  /** @intern */
  private issueMode:boolean = false;
  /** @intern */
  private selectMode:boolean = false;
  /** @intern */
  private seperator:number = -1;
  private readonly canIuse:boolean = true;
  private readonly isViewer:boolean = false;
  /* --------------------------------------------------------------------------- DEFINE : Internal Reference Variable */

  /* CONSTRUCTION AREA ---------------------------------------------------------------------------------------------- */
  constructor(paint:Paintor, canIuse:boolean, isViewer:boolean) {
    this.paint = paint;
    this.canIuse = canIuse;
    this.isViewer = isViewer
  }
  /* ---------------------------------------------------------------------------------------------- CONSTRUCTION AREA */

  /* METHOD : useRecoilState ---------------------------------------------------------------------------------------- */
  public useIssueList(issueList:Array<Issue>, setIssueList:Function) {
    this.issueList = issueList;
    this.setIssueList = setIssueList;

    this.circuitIssue();
  }

  public useSelectedIssue(selectedIssue:Issue|undefined, setSelectedIssue:Function) {
    this.selectedIssue = selectedIssue;
    this.setSelectedIssue = setSelectedIssue;
  }

  public useSelectedTool(selectedTool:Tools) {
    this.selectedTool = selectedTool;
  }

  public useIssueLog(deleteIssueLog:Function) {
    this.deleteIssueLog = deleteIssueLog;
  }
  /* ---------------------------------------------------------------------------------------- METHOD : useRecoilState */

  /* METHOD : Mode Change ------------------------------------------------------------------------------------------- */
  public setClearIssueMode() {
    if(!this.paint) return;

    this.__resetSelectedIssue();

    this.issueMode = false;
    this.paint.container.classList.remove(MARKER_PAINT_ISSUEMODE_CLASSNAME);
  }

  public setOnIssueMode() {
    if(!this.paint) return;

    if(!this.issueMode) {
      this.issueMode = true;
      this.paint.container.classList.add(MARKER_PAINT_ISSUEMODE_CLASSNAME);
    }
  }

  public setClearSelectMode() {
    this.selectMode = false;
  }

  public setOnSelectMode() {
    if(!this.selectMode) {
      this.selectMode = true;
    }
  }
  /* ------------------------------------------------------------------------------------------- METHOD : Mode Change */



  /* METHOD : Common ------------------------------------------------------------------------------------------------ */
  public circuitIssue() {
    /* @optionalBinding */ if(!this.paint || (!this.isViewer && !this.canIuse)) return;
    const svg = this.paint.svg;
    const scale = this.paint.svgScale;
    const imageSize = this.paint.originalImageSize;

    for (let i = 0; i < this.issueList.length; i++) {
      const issue = this.issueList[i];

      if(issue.status === 0) {
        const pos = { x:issue.x, y:issue.y };
        const alert = (issue.warning === 1);

        const is = Atelier.rendImage(pos, `issue_${issue.id}`, svg, imageSize, scale, alert);
        this.__issueEventBinding(is, issue.id);
      }
      else {
        Atelier.removeImage(`issue_${issue.id}`, svg);
      }
    }
  }

  public casingHandToolMove() {
    if(this.selectedIssue !== undefined) {
      const idx = this.issueList.findIndex(v => v.id === this.selectedIssue?.id);
      if(idx === -1) return;
      const issue = this.issueList[idx];

      this.setSelectedIssue(cloneDeep(issue));
    }
  }

  private __appendIssueMiddleware(position:Position) {
    const issue:Issue = {
      x: position.x,
      y: position.y,
      id: this.seperator,
      comment: '',
      warning: 0,
      add: true,
      status: 0
    }

    this.setSelectedIssue(issue);
  }

  private __issueEventBinding(issue:D3_Issue, issueId:number) {
    issue.on('mouseenter mousemove', () => {
      if(!this.paint) return;

      if(this.selectedTool === 5) {
        if(this.issueMode) {
          this.issueMode = false
        }
      }
    });

    issue.on('mouseleave', () => {
      if(!this.paint) return;

      if(this.selectedTool === 5) {
        if(!this.issueMode) {
          this.issueMode = true;
        }
      }
    })

    issue.on('mouseup', () => {
      if(this.selectedTool === 5) {
        if(!this.issueMode) {
          if(this.selectedIssue?.add === true) return;
          const _issue = this.__searchIssue(issueId);
          this.setSelectedIssue(cloneDeep(_issue));
        }
      }
      else {
        // 그리기 모드가 아닐 때, 클릭이 되면 셀렉트가 됨
        if(this.selectMode) {
          if(this.selectedIssue?.add === true) return;
          const _issue = this.__searchIssue(issueId);
          this.setSelectedIssue(cloneDeep(_issue));
        }
      }
    });
  }

  private __searchIssue(issueId:number) {
    const iId = this.issueList.findIndex(v => v.id === issueId);

    if(iId === -1) return undefined;
    return this.issueList[iId];
  }

  private __resetSelectedIssue() {
    if(resetIssue(this.selectedIssue)) {
      this.setSelectedIssue(undefined);
    }
  }
  /* ------------------------------------------------------------------------------------------------ METHOD : Common */

  /* METHOD : Event Binding ----------------------------------------------------------------------------------------- */
  public bindMouseupForIssue(e:MouseEvent) {
    if(this.issueMode) {
      this.__resetSelectedIssue();
      // if(this.selectedIssue?.add === true) return;

      this.__onCreateIssue(e);
    }
  }

  public bindKeyupByBackspace() {
    if(!!this.selectedIssue /*&& this.selectMode*/) {
      // 특정 이슈가 선택되어있고, selection Mode가 선택되어있다면
      this.__onDeleteIssue(); // 이슈를 삭제
    }
  }
  /* ----------------------------------------------------------------------------------------- METHOD : Event Binding */

  /* METHOD : Create Issue ------------------------------------------------------------------------------------------ */
  private __onCreateIssue(e:MouseEvent) {
    /* @optionalBinding */ if(!this.paint || !this.paint.svg) return;

    const { offsetX:x, offsetY:y } = e;
    const svg = this.paint.svg;
    const scale = this.paint.svgScale;
    const imageSize = this.paint.originalImageSize;

    const issue = Atelier.rendImage({x, y}, `issue_${this.seperator}`, svg, imageSize, scale, false);
    this.__issueEventBinding(issue, this.seperator);
    this.__appendIssueMiddleware({x, y});
    this.seperator--;
  }
  /* ------------------------------------------------------------------------------------------ METHOD : Create Issue */

  /* METHOD : Delete Issue ------------------------------------------------------------------------------------------ */
  private __onDeleteIssue() {
    /* @optionalBinding */ if(!this.selectedIssue) return;

    if(!document.getElementById(MARKER_PAINT_ISSUEMAKER_TEXTAREA_ID)?.classList.contains('focus')) {
      this.deleteIssueLog(this.selectedIssue.id);
      this.__dropList();
    }
  }

  private __dropList() {
    /* @optionalBinding */ if(!this.selectedIssue || !this.paint) return;

    const _issueList = cloneDeep(this.issueList)
    const index = _issueList.findIndex(v => v.id === this.selectedIssue?.id);

    if(index === -1) return;
    _issueList.splice(index, 1);
    this.setIssueList(_issueList);

    const id = `issue_${this.selectedIssue.id}`;
    const svg = this.paint.svg;
    Atelier.removeImage(id, svg);

    this.setSelectedIssue(undefined);
  }
  /* ------------------------------------------------------------------------------------------ METHOD : Delete Issue */
}