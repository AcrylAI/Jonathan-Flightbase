import { MouseEventHandler, ReactNode } from "react";

import classNames from "classnames/bind";
import styles from "./Button.module.scss";
const cx = classNames.bind(styles);

type Props = {
  onClick: MouseEventHandler<HTMLDivElement>;
  children: ReactNode;
  active?: boolean;
  disable?: boolean;
  title?: string;
  hover?: boolean;
  padding?: string;
}

/**
 * 마우스 오버 시 애니메이션을 표시할 버튼
 * @param onClick 버튼의 클릭 이벤트
 * @param children 버튼에 포함시킬 리액트 노드
 * @param active 버튼의 select 여부
 * @param disable 버튼의 비활성 여부
 * @param title 버튼에 마우스 오버 시 표시할 문자열
 * @param hover 버튼의 호버 이벤트 여부
 * @param padding 버튼의 padding 값
 */
function Select({ onClick, children, active=false, disable=false, title, hover=false, padding }: Props) {
  return (
    <div className={ cx("Select", active && 'active', disable && 'disable', hover && 'hover') }
         onClick={disable ? undefined : onClick}
         title={title}
         style={{ padding }} >
      { children }
    </div>
  )
}

export default Select;