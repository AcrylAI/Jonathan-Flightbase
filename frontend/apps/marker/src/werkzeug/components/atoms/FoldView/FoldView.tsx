import { ReactNode, useState } from "react";
import Collapsible from "react-collapsible";
import FoldIcon from "@src/werkzeug/assets/FoldIcon"

import classNames from "classnames/bind";
import styles from "./FoldView.module.scss";
const cx = classNames.bind(styles);

type Props = {
  head: ReactNode;
  body: ReactNode;
  open?: boolean;
}

function FoldView({ head, body, open=false }:Props) {
  const [fold, setFold] = useState(open);

  const onClickFold = () => {
    setFold(!fold);
  }

  return (
    <div className={ cx("FoldView") }>
      <header className={ cx("header") }>
        <div className={ cx("head") }>{ head }</div>
        <div className={ cx("foldicon", !fold && 'show') } onClick={onClickFold}><FoldIcon /></div>
      </header>

      <Collapsible trigger={""} easing="ease-out" open={fold} transitionTime={200}>
        <div className={ ("contents") }>
          { body }
        </div>
      </Collapsible>
    </div>
  )
}

export default FoldView;