import { CSSProperties, ReactNode } from "react";

import classNames from "classnames/bind";
import styles from "./ScrollView.module.scss";
const cx = classNames.bind(styles);

type Props = {
  children: ReactNode;
  padding?: string;
  className?: string;
}

function ScrollView({ children, padding, className }:Props) {
  const styles:CSSProperties = (() => {
    return { padding }
  })();

  return (
    <div className={ `${cx("ScrollView")} ${className}` } style={styles}>
      <div className={ cx("container") }>
        { children }
      </div>
    </div>
  )
}

export default ScrollView;