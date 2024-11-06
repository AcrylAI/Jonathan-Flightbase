import { ListSkeleton } from "@src/werkzeug/components/atoms";
import { Shortcut } from "@src/werkzeug/components/molecules";
import { Classes, Issues } from "@src/werkzeug/components/organisms";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
import useLoading from "@src/werkzeug/hooks/common/useLoading";

import classNames from "classnames/bind";
import styles from "./Nav.module.scss";
const cx = classNames.bind(styles);

function Nav() {
  const { isLabeler, isViewer } = useFileStatus();
  const { isPaintLoading } = useLoading();

  if(!isPaintLoading) {
    return (
      <nav className={ cx("Nav") }>
        {
          (isLabeler === true && isViewer === false) && <Classes />
        }
        {
          (isLabeler === false && isViewer === false) && <Issues />
        }
        <Shortcut />
      </nav>
    )
  }
  else {
    return (
      <nav className={ cx("Nav") }>
        <ListSkeleton />
        <Shortcut />
      </nav>
    )
  }
}

export default Nav;