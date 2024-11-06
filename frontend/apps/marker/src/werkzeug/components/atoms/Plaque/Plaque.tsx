import { CSSProperties, ReactNode } from "react";
import { Sypo } from "@src/components/atoms";

import classNames from "classnames/bind";
import styles from "./Plaque.module.scss";
const cx = classNames.bind(styles);

type Props = {
  children: ReactNode;
  color?: string;
  size?: number;
  style?: CSSProperties;
}
function Plaque({ children, size=24, color='inherit', style=undefined }:Props) {
  const _style:CSSProperties = {
    ...style,
    color,
    width: size,
    minWidth: size,
    maxWidth: size,
    height: size,
    minHeight: size,
    maxHeight: size
  }

  return (
    <div className={ cx("Plaque") } style={_style}>
      <Sypo type="p1" weight={400}>
        { children }
      </Sypo>
    </div>
  )
}

export default Plaque;