import { ReactNode } from "react";

import classNames from "classnames/bind";
import styles from "./Porcelain.module.scss";
const cx = classNames.bind(styles);

type Props = {
  children: ReactNode;
  color?: string;
}

function Porcelain({ children, color=undefined }:Props) {
  return (
    <div className={ cx("Porcelain") } style={{ backgroundColor:color }}>
      { children }
    </div>
  )
}

export default Porcelain;