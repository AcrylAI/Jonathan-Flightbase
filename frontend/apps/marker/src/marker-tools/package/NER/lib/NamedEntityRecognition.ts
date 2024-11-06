import { cloneDeep, sortBy } from 'lodash';

import { TextRenderType } from './types';

import {
  TextAnnotationCoordinateType as Position,
  TextAnnotationType,
} from '@tools/types/annotation';
import { ClassType } from '@tools/types/classes';
import { colorContrast } from '@tools/utils';

const LABEL_ID_PREFIX = 'labelid_';
const ISSUE_ID_PREFIX = 'issueid_';

class NamedEntityRecognition {
  /**
   * document.canvas의 id 값
   */
  private readonly canvasId: string;

  /**
   * document.paragraph의 id 값
   */
  private readonly paragraphId: string;

  /**
   * API를 통해 전달받은 Text 값
   */
  private readonly originText: string;

  /**
   * 현재 태깅된 라벨의 리스트
   */
  private labelList: Array<TextAnnotationType>;

  /**
   * 작성된 issue의 리스트
   */
  private issueList: Array<TextAnnotationType>;

  /**
   * 현재 생성된 Label의 id를 결정하기 위한 구분자
   */
  private seperator: number = 1;

  /**
   * NER 객체 생성자
   * @param canvasId
   * @param paragraphId
   * @param originText
   * @param labels
   * @param issues
   */
  constructor(
    canvasId: string,
    paragraphId: string,
    originText: string,
    labels: Array<TextAnnotationType>,
    issues: Array<TextAnnotationType>,
  ) {
    this.originText = originText;
    this.paragraphId = paragraphId;
    this.canvasId = canvasId;
    this.labelList = labels;
    this.issueList = issues;
  }

  /* ASSOCIATION FOR Selection ---------------------------------------------- */
  /**
   * 현재 선택된 범위의 Selection 객체를 읽어온다
   */
  get selection(): Selection | null {
    const selection = window.getSelection();

    if (
      selection === null ||
      selection?.toString().length === 0 ||
      selection?.focusNode?.childNodes.length !== 0
    )
      return null;

    return selection;
  }

  /**
   * Selection된 범위의 Range 객체를 읽어온다
   */
  get range(): Range | null {
    const { selection } = this;
    let range: Range | null = null;

    if (selection) range = selection.getRangeAt(0);

    return range;
  }

  /**
   * Selection된 범위의 Text를 읽어온다
   */
  get text(): string {
    const { selection } = this;

    if (selection) return selection.toString();

    return '';
  }

  /**
   * main.ner-space의 HTMLElement 객체를 return 하는 함수
   */
  get canvas(): HTMLElement | null {
    return document.getElementById(this.canvasId);
  }

  /**
   * labelList에 label 객체를 설정하는 함수
   * @param label { TextAnnotationType }
   */
  public setLabel(label: TextAnnotationType) {
    const id = label.id;

    const prevIndex = this.labelList.findIndex((v) => v.id === id);

    if (prevIndex !== -1) {
      this.labelList[prevIndex] = cloneDeep(label);
    } else {
      this.labelList.push(cloneDeep(label));
    }
  }

  /**
   * 선택한 영역을 풀어주는 함수
   */
  public blur() {
    const { selection } = this;

    if (selection) {
      if (selection?.empty) {
        selection.empty();
      } else if (selection?.removeAllRanges) {
        selection.removeAllRanges();
      }
    } else {
      document?.getSelection()?.empty();
    }
  }
  /* ---------------------------------------------- ASSOCIATION FOR Selection */

  /* ASSOCIATION FOR Positioning -------------------------------------------- */
  /**
   * 선택한 영역과 Class를 조합해서 LabelList에 push하는 함수
   * @param classes { ClassType } 선택한 class
   */
  public push(classes: ClassType) {
    const text = this.text;
    const position = this.position;
    const id = -this.seperator++;

    if (!position || !text.length) return;

    const label: TextAnnotationType = {
      id: id,
      classId: classes.id,
      className: classes.name,
      text: text,
      start: position.start,
      end: position.end,
      color: classes.color,
    };

    this.labelList.push(label);
    this.blur();
  }

  /**
   * p.ner-paragraph의 HTMLElement 객체를 return 하는 함수
   */
  private get paragraph(): HTMLElement | null {
    return document.getElementById(this.paragraphId);
  }

  /* New Positioning Area ------------------------------------------------------------------------------------------- */
  private get position(): Position | null {
    const { range } = this;
    if (!range) return null;

    const startOffset: number | null = this.getOffset(range.startContainer);
    const endOffset: number | null = this.getOffset(range.endContainer);

    if(startOffset === null || endOffset === null) return null;

    const start = startOffset + range.startOffset;
    const end = endOffset + range.endOffset;

    return { start: start, end: end };
  }

  private getOffset(element: Node): number | null {
    // 1. node.previousSibiling !== null?
    if (element.previousSibling) {
      // return previousSibiling.position.end
      const sibiling = element.previousSibling as HTMLElement;
      const annotation = this.getObjectClass(sibiling.classList);

      return annotation?.end ?? null;
    }
    // 2. node.parentElement === #paragraphId?
    if (!this.parentIsParagraph(element)) {
      if(!this.classHasIt((element.parentElement as HTMLElement).classList, 'ner-right')) {
        const parent = element.parentElement as HTMLElement;
        const annotation = this.getObjectClass(parent.classList);

        return annotation?.start ?? null;
      }
      else {
        const parent = element.parentElement as HTMLElement;
        const annotation = this.getObjectClass(parent.classList);

        const end = annotation?.end ?? null;
        return (end !== null) ? end - 1 : null;
      }
    }

    return 0;
  }

  /**
   * DOMTokenList 상태의 클래스 리스트에서 LABEL_ID_PREFIX로 시작하는 클래스의 id값을 추출하는 함수
   * @param tokenList 추출하고자하는 클래스 리스트
   */
  private getObjectClass(tokenList: DOMTokenList): TextAnnotationType | null {
    const split = tokenList.value.split(' ');
    const labelId = split.find((v) => v.includes(LABEL_ID_PREFIX));
    const issueId = split.find((v) => v.includes(ISSUE_ID_PREFIX));

    if (labelId) {
      const id = labelId.replace(LABEL_ID_PREFIX, '');
      return this.getObjectFromId(Number(id), this.labelList);
    }
    if (issueId) {
      const id = issueId.replace(ISSUE_ID_PREFIX, '');
      return this.getObjectFromId(Number(id), this.issueList);
    }

    return null;
  }

  private classHasIt(tokenList: DOMTokenList, hasit: string): boolean {
    const split = tokenList.value.split(' ');
    return split.includes(hasit);
  }

  private getObjectFromId(
    id: number,
    list: Array<TextAnnotationType>,
  ): TextAnnotationType | null {
    return list.find((v) => v.id === id) ?? null;
  }

  /**
   * argument로 받은 element의 부모가 ner-paragraph인지 확인하는 함수
   * @param element 부모 엘리먼트를 확인하기 위한 Node 객체
   */
  private parentIsParagraph(element: Node): boolean {
    const { paragraph } = this;
    if (!paragraph) return false;

    return paragraph === element.parentElement;
  }
  /* ------------------------------------------------------------------------------------------- New Positioning Area */

  // /**
  //  * 선택한 영역의 정확한 좌표값을 읽어오는 함수
  //  */
  // private get position(): Position | null {
  //   const { range } = this;
  //   if (!range) return null;
  //
  //   let startOffset: number | null = null;
  //   let endOffset: number | null = null;
  //   let start = 0;
  //   let end = 0;
  //
  //   // 드래그의 시작지점과 끝지점의 부모가 같은 경우
  //   // 서로소 || 부분집합
  //   if (
  //     range.startContainer.parentElement === range.endContainer.parentElement
  //   ) {
  //     // 서로소 : 부모가 paragraph인 경우
  //     if (this.parentIsParagraph(range.startContainer)) {
  //       startOffset = this.getPreviousEndOffset(range.startContainer);
  //       endOffset = this.getPreviousEndOffset(range.endContainer);
  //       if (startOffset === null || endOffset == null) return null;
  //
  //       start = startOffset + range.startOffset;
  //       end = endOffset + range.endOffset;
  //     }
  //     // 부분집합 : 부모가 span인 경우
  //     else {
  //       startOffset = this.getParentStartOffset(range.startContainer);
  //       if (startOffset === null) return null;
  //
  //       start = startOffset + range.startOffset;
  //       end = startOffset + range.endOffset;
  //     }
  //   }
  //   // 드래그의 시작지점과 끝지점의 부모가 다른 경우
  //   // 교집합 : start.parent와 end.parent가 다른 경우
  //   else {
  //     if (this.parentIsParagraph(range.startContainer)) {
  //       // 교집합이 뒤에 있는 경우
  //       startOffset = this.getPreviousEndOffset(range.startContainer);
  //       // endOffset = this.getParentStartOffset(range.endContainer);
  //     } else if (this.parentIsSpan(range.startContainer)) {
  //       // 교집합이 앞에 있는 경우
  //       startOffset = this.getParentStartOffset(range.startContainer);
  //       // endOffset = this.getPreviousEndOffset(range.endContainer);
  //     }
  //
  //     if (this.parentIsParagraph(range.endContainer)) {
  //       // 교집합이 앞에 있는 경우
  //       endOffset = this.getPreviousEndOffset(range.endContainer);
  //     } else if (this.parentIsSpan(range.endContainer)) {
  //       // 교집합이 뒤에 있는 경우
  //       endOffset = this.getParentStartOffset(range.endContainer);
  //     }
  //
  //     // 버그
  //     if (startOffset === null || endOffset === null) return null;
  //
  //     start = startOffset + range.startOffset;
  //     end = endOffset + range.endOffset;
  //   }
  //
  //   return { start, end };
  // }

  // /**
  //  * argument로 받은 element의 부모가 ner-span인지 확인하는 함수
  //  * @param element { Node } 부모 엘리먼트를 확인하기 위한 Node 객체
  //  */
  // private parentIsSpan(element: Node): boolean {
  //   if (!element.parentElement) return false;
  //   const classList = element.parentElement.classList.value.split(' ');
  //
  //   return classList.includes('ner-span');
  // }

  // /**
  //  * element에서 previos sibiling을 읽어와 해당되는 label의 end offset을 읽어오는 함수
  //  * @param element 현재 선택된 영역의 node
  //  */
  // private getPreviousEndOffset(element: Node): number | null {
  //   if (element.previousSibling === null) {
  //     // else : previousSibling이 없을 때 : 온존한 index
  //     return 0;
  //   }
  //
  //   // else : previousSibling이 있을 때 : 오염된 index
  //   // element의 previousSibiling을 읽는다.
  //   const sibiling = element.previousSibling as HTMLElement;
  //
  //   const isThisSpan = this.getIdClass(sibiling.classList);
  //
  //   if (isThisSpan?.includes(LABEL_ID_PREFIX)) {
  //     // previousSibiling의 labelid에서 id값을 읽는다.
  //     const labelId = this.getIdClass(sibiling.classList)?.replace(
  //       LABEL_ID_PREFIX,
  //       '',
  //     );
  //     if (!labelId) return null;
  //
  //     // 가져온 id 값으로 Label을 찾는다.
  //     const prevLabel = this.getLabel(labelId, this.labelList);
  //     if (!prevLabel) return null;
  //
  //     // label의 end 주소에서 1을 더한다(getSelection.startOffset의 시작점을 return)
  //     return prevLabel.end;
  //   }
  //   if (isThisSpan?.includes(ISSUE_ID_PREFIX)) {
  //     // previousSibiling의 labelid에서 id값을 읽는다.
  //     const issueId = this.getIdClass(sibiling.classList)?.replace(
  //       ISSUE_ID_PREFIX,
  //       '',
  //     );
  //     if (!issueId) return null;
  //
  //     // 가져온 id 값으로 Label을 찾는다.
  //     const prevLabel = this.getLabel(issueId, this.issueList);
  //     if (!prevLabel) return null;
  //
  //     // label의 end 주소에서 1을 더한다(getSelection.startOffset의 시작점을 return)
  //     return prevLabel.end;
  //   }
  //
  //   return null;
  // }

  // /**
  //  * element의 parent element를 읽어와 해당되는 label의 start offset을 읽어오는 함수
  //  * @param element 현재 선택된 영역의 node
  //  */
  // private getParentStartOffset(element: Node): number | null {
  //   if (!element.parentElement) return null;
  //
  //   if (element.previousSibling === null) {
  //     // parent의 labelid에서 id값을 읽는다.
  //     const parent = element.parentElement;
  //
  //     const isThisSpan = this.getIdClass(parent.classList);
  //
  //     if (isThisSpan?.includes(LABEL_ID_PREFIX)) {
  //       const labelId = this.getIdClass(parent.classList)?.replace(
  //         LABEL_ID_PREFIX,
  //         '',
  //       );
  //       if (!labelId) return null;
  //
  //       // 가져온 id 값으로 Label을 찾는다.
  //       const prevLabel = this.getLabel(labelId, this.labelList);
  //       if (!prevLabel) return null;
  //
  //       return prevLabel.start;
  //     }
  //     if (isThisSpan?.includes(ISSUE_ID_PREFIX)) {
  //       const issueId = this.getIdClass(parent.classList)?.replace(
  //         ISSUE_ID_PREFIX,
  //         '',
  //       );
  //       if (!issueId) return null;
  //
  //       // 가져온 id 값으로 Label을 찾는다.
  //       const prevLabel = this.getLabel(issueId, this.issueList);
  //       if (!prevLabel) return null;
  //
  //       return prevLabel.start;
  //     }
  //   }
  //   // 같은 parent를 둔 sibiling이 있는 경우
  //   return this.getPreviousEndOffset(element);
  // }

  // /**
  //  * DOMTokenList 상태의 클래스 리스트에서 LABEL_ID_PREFIX로 시작하는 클래스의 id값을 추출하는 함수
  //  * @param tokenList 추출하고자하는 클래스 리스트
  //  */
  // private getIdClass(tokenList: DOMTokenList): string | null {
  //   return (
  //     tokenList.value.split(' ').find((v) => v.includes(LABEL_ID_PREFIX)) ??
  //     tokenList.value.split(' ').find((v) => v.includes(ISSUE_ID_PREFIX)) ??
  //     null
  //   );
  // }

  // /**
  //  * labelidclass 또는 id를 이용해 해당되는 label을 탐색하는 함수
  //  * @param id 탐색하고자하는 id값 또는 labelidClass
  //  */
  // private getLabel(
  //   id: string | number,
  //   list: Array<TextAnnotationType>,
  // ): TextAnnotationType | null {
  //   let _id = -1;
  //
  //   if (typeof id !== 'number') {
  //     const intId = Number(id);
  //     _id = Number.isNaN(intId)
  //       ? Number(id.replace(LABEL_ID_PREFIX, ''))
  //       : intId;
  //   } else {
  //     _id = id;
  //   }
  //
  //   return list.find((v) => v.id === _id) ?? null;
  // }

  /* ASSOCIATION FOR Render ------------------------------------------------- */
  /**
   * 입력받은 labelList를 innerHTML로 render하기 위해 가공하는 메소드
   */
  private get renderList(): Array<TextRenderType> {
    /*
     * Sorting의 공식
     * 1. 각각의 집합은 start로 구별된다
     * 2. 가장 큰 집합이 구별된 집단에서 최우선한다
     */
    const labels = cloneDeep(this.labelList);
    // const issues = cloneDeep(this.issueList.filter(v => v.status === 0));
    const issues = cloneDeep(this.issueList.filter(v => v.status !== 1));
    const endResv = sortBy(labels.concat(issues), 'end').reverse();
    const sorted = sortBy(endResv, 'start');

    /*
     * 경우의 수
     * 1. 두 집합의 관계가 서로소인 경우
     * 2. 두 집합의 관계가 부분집합 관계인 경우
     * 3. 두 집합의 관계가 차집합이 존재하는 교집합 관계인 경우
     */
    const renderList: Array<TextRenderType> = [];
    const stack: Array<TextAnnotationType> = [];

    for (let i = 0; i < sorted.length; i++) {
      /*  push하기 전에 stack이 남아있는지 확인
       *   sorted.start와 stack.end 크기비교
       *     forj
       *     stackCounter < 0 : break
       *     sorted[i].start > stack[j].end : stack.pop || stack.splice // stackCounter--
       *     sorted[i].start < stack[j].end : continue
       * ??? sorted[i]를 stack에 push // stackCounter++
       * */
      for (let j = 0; j < stack.length; j++) {
        if (sorted[i].start >= stack[j].end) {
          stack.splice(j, 1);
          j--;
        }
      }

      const stackCounter = stack.length - 1;

      /*  renderType Object 생성
       *   두 집합의 관계가 서로소인 경우 : stackCounter === -1 || stack[j].end < sorted[i].start
       *     id=self, start=self, end=self, name=self, level=0, isClose=false, isLast=true, direction=undefiend
       *   두 집합의 관계가 부분집합 관계인 경우 : stack[j].end >= sorted[i].end
       *     id=self, start=self, end=self, name=self, level=stack.length, isClose=false, isLast=true, direction=undefined
       *   두 집합의 관계가 교집합 관계인 경우 : stack[j].end >= sorted[i].start
       *     [0] id=self, start=self, end=stack[j].end, name=stack[j].name, level=stack.length, isClose=false, isLast=true, direction=left
       *     [1] id=self, start=stack[j].end, end=self, name=self, level=stack.length, isClose=false, isLast=true, direction=right
       *     * 다만 부모에 해당되는 집합의 isClose=true // 전부다 isClose=true로 해도 될거 같음
       * */
      if (stackCounter === -1 || stack[stackCounter].end <= sorted[i].start) {
        renderList.push({
          id: sorted[i].id,
          start: sorted[i].start,
          end: sorted[i].end,
          className: sorted[i].className,
          color: sorted[i].color,
          border: sorted[i].color,
          level: stack.length,
          isClose: true,
          isLast: true,
          isComment: sorted[i].comment !== undefined,
        });
      } else if (stack[stackCounter].end >= sorted[i].end) {
        renderList.push({
          id: sorted[i].id,
          start: sorted[i].start,
          end: sorted[i].end,
          className: sorted[i].className,
          color: sorted[i].color,
          border: sorted[i].color,
          level: stack.length,
          isClose: true,
          isLast: true,
          isComment: sorted[i].comment !== undefined,
        });
      } else if (stack[stackCounter].end > sorted[i].start) {
        let level = 0;

        for (let j = 0; j < renderList.length; j++) {
          if(
            renderList[j].start < sorted[i].start &&
            renderList[j].end > sorted[i].start
          ) {
            renderList[j].isLast = !renderList[j].isLast;
            level = renderList[j].level + 1;
          }

          if(
            renderList[j].start < sorted[i].end &&
            renderList[j].end >= sorted[i].end
          ) {
            renderList[j].isLast = !renderList[j].isLast;
            level = renderList[j].level + 1;
            renderList[j].isClose = !renderList[j].isClose;
          }

          // if (
          //   (renderList[j].start <= sorted[i].start &&
          //   renderList[j].end > sorted[i].start) ||
          //   (renderList[j].start < sorted[i].end &&
          //     renderList[j].end >= sorted[i].end)
          // ) {
          //   renderList[j].isLast = false;
          //   level = renderList[j].level + 1;
          // }
        }

        renderList.push({
          id: sorted[i].id,
          start: sorted[i].start,
          end: stack[stackCounter].end,
          className: stack[stackCounter].className,
          color: stack[stackCounter].color,
          border: sorted[i].color,
          level,
          isClose: true,
          isLast: true,
          direction: 'left',
          isComment: sorted[i].comment !== undefined,
        });
        renderList.push({
          id: sorted[i].id,
          start: stack[stackCounter].end,
          end: sorted[i].end,
          className: sorted[i].className,
          color: sorted[i].color,
          border: sorted[i].color,
          level,
          isClose: true,
          isLast: true,
          direction: 'right',
          isComment: sorted[i].comment !== undefined,
        });
      }

      stack.push(sorted[i]);
    }

    return renderList;
  }

  /**
   * renderList를 innerHTML로 변환하는 메소드
   */
  private get renderHTML(): string {
    const list = this.renderList;
    // renderList가 없으면 원본 텍스트 출력
    if (list.length === 0) {
      return this.originText;
    }

    const htmlList: Array<string[]> = [];

    // text길이 만큼 빈 배열을 작성
    for (let i = 0; i < this.originText.length + 1; i++) {
      htmlList.push([]);
    }

    // start에 span 태그 작성 end에 닫는 태그 작성
    for (let i = 0; i < list.length; i++) {
      const htmlString = this.objectToText(list[i]);
      htmlList[list[i].start].push(htmlString);
      htmlList[list[i].end].push('</span>');
    }

    // 해당 위치에 텍스트 나열
    for (let i = 0; i < htmlList.length; i++) {
      htmlList[i].push(this.originText[i]);
    }

    // htmlList를 통합
    const html: string = htmlList.map((v) => v.join('')).join('');
    return html;
  }

  /**
   * TextRenderType을 innerHTML로 변경하는 메소드
   * @param renderObject { TextRenderType } object로 정의된 innerHTML
   * @private
   */
  private objectToText(renderObject: TextRenderType): string {
    const classArr: Array<string> = ['ner-span'];
    const styleArr: Array<string> = [];

    if (!renderObject.isComment) {
      classArr.push(`${LABEL_ID_PREFIX}${renderObject.id}`);
      styleArr.push(`--ner-name: &quot;${renderObject.className}&quot;`);
      styleArr.push(`--ner-color: ${renderObject.color}`);
      styleArr.push(`--ner-border: ${renderObject.border}`);
      styleArr.push(`--ner-level: ${renderObject.level}`);
      styleArr.push(`--ner-contrast: ${colorContrast(renderObject.color)}`);
    } else {
      classArr.push(`${ISSUE_ID_PREFIX}${renderObject.id}`);
      classArr.push(`ner-comment`);
      styleArr.push(`--ner-border: #fa4e57`);
      styleArr.push(`--ner-level: ${renderObject.level}`);
      styleArr.push(`--ner-color: none`);
    }

    if (renderObject.isClose) {
      classArr.push('ner-close');
    }
    if (renderObject.isLast) {
      classArr.push('ner-last');
    }
    if (renderObject.direction) {
      classArr.push(`ner-${renderObject.direction}`);
    }

    const classText = classArr.join(' ');
    const styleText = styleArr.join('; ');

    return `<span class="${classText}" style="${styleText};">`;
  }

  /**
   * this.paragraph에 render된 HTML 출력
   */
  public render() {
    if (this.paragraph) {
      this.paragraph.innerHTML = this.renderHTML;
    }
  }
  /* ------------------------------------------------- ASSOCIATION FOR Render */

  /* ASSOCIATION For Export Label List -------------------------------------- */
  /**
   * 현재까지 저장된 labelList를 return 해주는 메소드
   */
  get Labels(): Array<TextAnnotationType> {
    return this.labelList;
  }

  /**
   * 외부에서 labelList를 set하게 만드는 메소드
   * @param labels { Array<TextAnnotationType> } 외부에서 set하려고 하는 labelList
   */
  set Labels(labels: Array<TextAnnotationType>) {
    this.labelList = labels;
  }
  /* -------------------------------------- ASSOCIATION For Export Label List */

  /* ASSOCIATION FOR Issueing ----------------------------------------------- */
  /**
   * issue를 임시로 추가하는 메소드
   * 만약 입력되지 않은 issue가 있다면 기존에 있는 비어있는 issue를 삭제한다
   */
  public issueing() {
    const text = this.text;
    const position = this.position;
    const id = -this.seperator++;

    if (!position || !text.length) return;

    const issue: TextAnnotationType = {
      id: id,
      classId: 0,
      className: '',
      text: text,
      start: position.start,
      end: position.end,
      color: '',
      comment: '',
    };

    const emptyIndex = this.issueList.findIndex((v) => v.comment?.length === 0);

    if (emptyIndex > -1) {
      this.issueList.splice(emptyIndex, 1);
    }

    this.issueList.unshift(issue);
    this.blur();
  }

  /**
   * 현재까지 작성된 issueList를 return 해주는 메소드
   */
  get Issues(): Array<TextAnnotationType> {
    return this.issueList;
  }

  /**
   * 외부에서 issueList를 set 해주는 메소드
   * @param issues { Array<TextAnnotationType> } 외부에서 전달하려는 issueList
   */
  set Issues(issues: Array<TextAnnotationType>) {
    this.issueList = issues;
  }
  /* ----------------------------------------------- ASSOCIATION FOR Issueing */
}

export default NamedEntityRecognition;
