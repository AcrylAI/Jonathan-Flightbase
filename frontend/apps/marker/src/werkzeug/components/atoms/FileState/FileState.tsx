import useT from "@src/hooks/Locale/useT";
import { Sypo } from "@src/components/atoms";
import { FileStatus } from "@src/werkzeug/defs/annotation";
import Icon from "@src/werkzeug/assets";
import classnames from "classnames/bind";
import styles from "./FileState.module.scss";

const cx = classnames.bind(styles);
const {
  FileNotAssignedIcon,
  FileApprovedIcon,
  FileInProgressIcon,
  FileSubmittedIcon,
  FileRejectedIcon
} = Icon;

type Props = {
  type?: FileStatus;
}

function FileState({ type=undefined }:Props) {
  const { t } = useT();

  const casing = () => {
    switch (type) {
      case 0: // 미할당
        return (<><FileNotAssignedIcon/><Sypo type='p2'>{t(`component.jobstatus.notassigned`)}</Sypo></>);
      case 1: // 승인됨
        return (<><FileApprovedIcon/><Sypo type='p2'>{t(`component.jobstatus.approved`)}</Sypo></>);
      case 2: // 작업중
        return (<><FileInProgressIcon/><Sypo type='p2'>{t(`component.jobstatus.inprogress`)}</Sypo></>);
      case 3: // 검수중
        return (<><FileSubmittedIcon/><Sypo type='p2'>{t(`component.jobstatus.submitted`)}</Sypo></>);
      case 4: // 반려됨
        return (<><FileRejectedIcon/><Sypo type='p2'>{t(`component.jobstatus.rejected`)}</Sypo></>);
      default:
        return null;
    }
  }

  if(type !== undefined) {
    return (
      <div className={ cx("FileState") }>
        { casing() }
      </div>
    )
  }
  else {
    return null;
  }
}

export default FileState;