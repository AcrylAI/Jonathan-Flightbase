import { CSSProperties, ReactNode, useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import classNames from "classnames/bind";
import styles from "./FloatView.module.scss";
import { Position, Size } from "@src/werkzeug/defs/draw";
import { useRecoilValue } from "recoil";
import { selectedAnnotationAtom, selectedIssueAtom } from "@src/werkzeug/stores/paintStore";
const cx = classNames.bind(styles);

type Props = {
  id: string;
  children: ReactNode;
  animation?: boolean;
  show?: boolean;
  parentId?: string;
  anchorId?: string;
  style?: CSSProperties;
  marginTop?: number;
  marginEnd?: number;
}

function FloatView(props:Props) {
  const {
    id, children,
    animation=false,
    show=false,
    parentId=undefined,
    anchorId=undefined,
    marginTop = 0,
    marginEnd = 0,
    style=undefined,
  } = props;

  const selectedAnno = useRecoilValue(selectedAnnotationAtom);
  const selectedIssue = useRecoilValue(selectedIssueAtom);

  const [pos, setPos] = useState<Position>({ x:0, y:0 });
  const [wholeHeight, setWholeHeight] = useState<number>(0);
  const contentRef = useRef(null);

  /** 컴포넌트가 표시될 Container의 Size를 읽어오는 함수  */
  const getContainerSize = ():Size => {
    /* @optionalBinding */ if(parentId === undefined) return { width:0, height:0 };

    const { width, height } = (d3.select(`#${parentId}`).node() as HTMLElement).getBoundingClientRect();
    return { width, height };
  }

  const getContainerPositon = ():Position => {
    /* @optionalBinding */ if(parentId === undefined) return { x:0, y:0 };

    const { x, y } = (d3.select(`#${parentId}`).node() as HTMLElement).getBoundingClientRect();
    return { x, y };
  }

  /** FloatView의 내부에 표시될 View의 Size를 읽어오는 함수 */
  const getViewSize = ():Size => {
    /* @optionalBinding */ if(!contentRef.current) return { width:0, height:0 };

    const { width, height } = ((contentRef.current) as HTMLDivElement).getBoundingClientRect();
    return { width, height }
  }

  /** FloatView가 표시될 Anchor의 Position을 읽어오는 함수 */
  const getAnchorPositon = ():Position => {
    const out = { x:0, y:0 }
    /* @optionalBinding */ if(anchorId === undefined) return out;

    const anchor = d3.select(anchorId).node();
    const { x:anchorX, y:anchorY, width:anchorWidth } = (anchor as Element).getBoundingClientRect();

    const { x:containerX, y:containerY } = getContainerPositon();
    const { width:containerWidth, height:containerHeight } = getContainerSize();
    const { width:viewWidth, height:viewHeight } = getViewSize();

    // x를 구하는 로직
    const right = anchorX - containerX + anchorWidth + marginEnd;
    if(right + viewWidth > containerWidth) { // 오른쪽에 공간이 없을 경우
      const left = anchorX - containerX - viewWidth - marginEnd;
      if(left < 0) { // 왼쪽에 공간이 없는 경우
        out.x = anchorX - containerX + anchorWidth - viewWidth - marginEnd;
      }
      else { // 왼쪽에 공간이 넉넉한 경우
        out.x = left;
      }
    }
    else { // 오른쪽에 공간이 많을 경우
      out.x = right;
    }

    // y를 구하는 로직
    const top = anchorY - containerY - marginTop;
    if(top + viewHeight > containerHeight) out.y = containerHeight - viewHeight;
    else              out.y = top;

    return out;
  }

  /** selectAnno가 변경될 때, parentId와 anchorId를 읽어와  */
  useEffect(() => {
    /* @optionalBinding */ if(!selectedAnno || parentId === undefined || anchorId === undefined) return;

    setPos(getAnchorPositon());
  }, [parentId, anchorId, wholeHeight, selectedAnno])

  useEffect(() => {
    /* @optionalBinding */ if(!selectedIssue || parentId === undefined || anchorId === undefined) return;

    setPos(getAnchorPositon());
  }, [parentId, anchorId, wholeHeight, selectedIssue])

  useEffect(() => {
    const doc = document.getElementById(id);
    if(!!doc) setWholeHeight(doc.getBoundingClientRect().height)
  }, [id, show])

  return (
    <div className={ `${cx("FloatView", animation && 'animation', show ? 'show':'hidden')}` }
         ref={contentRef}
         id={id}
         style={{ ...style, top:pos.y, left:pos.x }} >
      <div className={ cx("container") }>
        { children }
      </div>
    </div>
  )
}

export default FloatView;