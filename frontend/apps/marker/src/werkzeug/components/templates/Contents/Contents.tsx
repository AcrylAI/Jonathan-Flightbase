import { IssueMaker, IssueViewer, Properties } from "@src/werkzeug/components/molecules";
import { Paint } from "@src/werkzeug/components/tools";
import { useRecoilValue } from "recoil";
import { jobInfoAtom, onDataLoadAtom } from "@src/werkzeug/stores/fetchStore";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
import useLoading from "@src/werkzeug/hooks/common/useLoading";

import classNames from "classnames/bind";
import styles from "./Contents.module.scss";
import { PaintSkeleton } from "@src/werkzeug/components/atoms";
const cx = classNames.bind(styles);

function Contents() {
  const jobInfo = useRecoilValue(jobInfoAtom);
  const dataLoad = useRecoilValue(onDataLoadAtom);

  const { isLabeler } = useFileStatus();
  const { isPaintLoading } = useLoading();

  if(!isPaintLoading && dataLoad === 1) {
    return (
      <main className={ cx("Contents") }>
        <Paint />
        {
          (!!jobInfo && [1, 2, 4].includes(jobInfo.fileStatus) || isLabeler === true) &&
		    <IssueViewer />
        }
        {
          (!!jobInfo && [3].includes(jobInfo.fileStatus) && isLabeler === false ) &&
		    <IssueMaker />
        }
        <Properties />
      </main>
    )
  }
  else {
    return (
      <main className={ cx("Contents") }>
        <PaintSkeleton error={(dataLoad === -1)} />
      </main>
    )
  }
}

export default Contents;