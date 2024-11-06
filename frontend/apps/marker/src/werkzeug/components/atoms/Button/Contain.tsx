import { MouseEventHandler, ReactNode } from "react";

import classNames from "classnames/bind";
import styles from "./Button.module.scss";
const cx = classNames.bind(styles);

type Props = {
  onClick: MouseEventHandler<HTMLDivElement>;
  children: ReactNode;
  disable?: boolean;
  colorSet?: 'blue'|'red';
  padding?: string;
  title?: string;
}

/**
 * 배경색이 꽉 찬 버튼 컴포넌트
 * @param onClick 클릭 이벤트
 * @param children 포함 시킬 리액트 노드
 * @param disable 버튼의 비활성 여부
 * @param colorSet 버튼의 컬러 테마
 * @param padding 버튼의 padding 값
 * @param title 버튼에 마우스 호버시 표시할 문자열
 */
function Contain({ onClick, children, disable=false, colorSet='blue', padding, title }:Props) {
  return (
    <div className={ cx("Contain", disable && 'disable', colorSet) }
         onClick={disable ? undefined : onClick}
         style={{ padding }}
         title={title}
    >
      { children }
    </div>
  )
}

export default Contain;