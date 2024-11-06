import { FileNavi, JobStatus, Adjustment } from "@src/werkzeug/components/molecules";
import { Labels } from "@src/werkzeug/components/organisms";

import classNames from "classnames/bind";
import styles from "./Aside.module.scss";
const cx = classNames.bind(styles);

function Aside() {
  return (
    <aside className={ cx("Aside") }>
      <FileNavi />
      <JobStatus />
      <Labels />
      <Adjustment />
    </aside>
  )
}

export default Aside;