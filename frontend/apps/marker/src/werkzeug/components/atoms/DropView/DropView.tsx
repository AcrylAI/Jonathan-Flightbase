import { ReactNode } from "react";
import Collapsible from "react-collapsible";

import classNames from "classnames/bind";
import styles from "./DropView.module.scss";
const cx = classNames.bind(styles);

type Props = {
  children: ReactNode;
  open: boolean;
}

function DropView({ children, open }:Props) {
  return (
    <div className={ cx("DropView") }>
      <Collapsible trigger={""} easing="ease-out" open={open} transitionTime={200}>
        <div className={ cx("contents") }>
          { children }
        </div>
      </Collapsible>
    </div>
  )
}

export default DropView;