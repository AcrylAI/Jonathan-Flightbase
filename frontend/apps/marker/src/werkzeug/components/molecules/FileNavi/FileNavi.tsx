import { useRecoilValue } from "recoil";
import { jobInfoAtom } from "@src/werkzeug/stores/fetchStore";
import { Sypo } from "@src/components/atoms";
import usePostJobReject from "@src/werkzeug/hooks/api/usePostJobReject";
import usePostJobSave from "@src/werkzeug/hooks/api/usePostJobSave";
import usePathfinder from "@src/werkzeug/hooks/common/usePathfinder";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
import Icon from "@src/werkzeug/assets";
import { Button } from "@src/werkzeug/components/atoms";

import classNames from "classnames/bind";
import styles from "./FileNavi.module.scss";

const cx = classNames.bind(styles);
const { CareLeftIcon, CareRightIcon } = Icon;

function FileNavi() {
  const jobInfo = useRecoilValue(jobInfoAtom);

  const { saveJob } = usePostJobSave();
  const { saveReview } = usePostJobReject();
  const { movePath } = usePathfinder();
  const { canIUse } = useFileStatus();

  const saveAndMove = async (jobId:number) => {
    if(!jobInfo) return;

    if(canIUse) {
      if([2, 4].includes(jobInfo.fileStatus)) { // 라벨링
        await saveJob();
      }
      else if([3].includes(jobInfo.fileStatus)) { // 리뷰잉
        await saveReview();
      }
    }

    movePath(jobId)
  }

  const onClickLeft = async () => {
    if(!jobInfo || jobInfo.prevId === 0) return;
    await saveAndMove(jobInfo.prevId);
  }

  const onClickRight = async () => {
    if(!jobInfo || jobInfo.nextId === 0) return;
    await saveAndMove(jobInfo.nextId);
  }

  return (
    <div className={ cx("FileNavi") }>
      <Button.Select onClick={onClickLeft} hover
                     disable={jobInfo?.prevId===0}>
        <CareLeftIcon />
      </Button.Select>
      <div className={ cx("box") }>
        {
          jobInfo !== undefined &&
	        <Sypo type='h4'>{ `${jobInfo.currentCnt} / ${jobInfo.allWork}` }</Sypo>
        }
      </div>
      <Button.Select onClick={onClickRight} hover
                     disable={jobInfo?.nextId===0}>
        <CareRightIcon />
      </Button.Select>
    </div>
  )
}

export default FileNavi;