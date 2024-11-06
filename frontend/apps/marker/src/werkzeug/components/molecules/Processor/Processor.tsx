import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useParams } from "react-router-dom";
import { Sypo } from "@src/components/atoms";
import useT from "@src/hooks/Locale/useT";
import { snackbarAtom } from "@src/stores/components/Snackbar/SnackbarStore";
import usePostJobSave from "@src/werkzeug/hooks/api/usePostJobSave";
import usePostJobReject from "@src/werkzeug/hooks/api/usePostJobReject";
import usePathfinder from "@src/werkzeug/hooks/common/usePathfinder";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
import { jobInfoAtom, latestSubmitAtom } from "@src/werkzeug/stores/fetchStore";
import { Button } from "@src/werkzeug/components/atoms";
import { SubmitBar } from "@src/werkzeug/components/molecules/Snackbar";
import { wait } from "@src/werkzeug/lib/Util";

import classNames from "classnames/bind";
import styles from "./Processor.module.scss";

const cx = classNames.bind(styles);

function Processor() {
  const { t } = useT();

  const jobInfo = useRecoilValue(jobInfoAtom);
  const [snackbar, setSnackbar] = useRecoilState(snackbarAtom);
  const setLatestSubmitId = useSetRecoilState(latestSubmitAtom);

  const { jid } = useParams();
  const { submitJob } = usePostJobSave();
  const { rejectReview, approveReview } = usePostJobReject();
  const { movePath, reload } = usePathfinder();
  const { isLabeler, canIUse } = useFileStatus();

  const onClickSubmit = async () => {
    if(!canIUse) return;

    setLatestSubmitId(Number(jid) || 0);
    await submitJob();

    if(snackbar.show) {
      setSnackbar(cur => ({
        ...cur, show: false
      }))
      await wait(200)
    }

    setSnackbar({
      show: true,
      contents: <SubmitBar/>
    })

    if(!jobInfo) return;

    if(jobInfo.nextId !== 0) {
      movePath(jobInfo.nextId);
    }
    else {
      await reload();
    }
  }
  const onClickReject = async () => {
    if(!canIUse) return;
    await rejectReview();

    if(!jobInfo) return;

    if(jobInfo.nextId !== 0) {
      movePath(jobInfo.nextId);
    }
    else {
      await reload();
    }
  }
  const onClickApprove = async () => {
    if(!canIUse) return;
    await approveReview();

    if(!jobInfo) return;

    if(jobInfo.nextId !== 0) {
      movePath(jobInfo.nextId);
    }
    else {
      await reload();
    }
  }

  return (
    <div className={ cx("Processor") }>
      {
        (!!jobInfo && (isLabeler===true)) &&
	      <Button.Contain onClick={onClickSubmit}
                        padding="8px 20px"
                        disable={!(canIUse === true)} >
		      <Sypo type="h4" weight={500}>{t(`component.processor.submit`)}</Sypo>
	      </Button.Contain>
      }
      {
        (!!jobInfo && (isLabeler===false)) &&
        <>
            <Button.Contain onClick={onClickReject}
                            padding="7px 20px"
                            colorSet='red'
                            disable={!(canIUse === true)} >
	            <Sypo type="h4" weight={500}>{t(`component.processor.reject`)}</Sypo>
            </Button.Contain>
            <Button.Contain onClick={onClickApprove}
                            padding="8px 20px"
                            disable={!(canIUse === true)} >
              <Sypo type="h4" weight={500}>{t(`component.processor.approve`)}</Sypo>
            </Button.Contain>
        </>
      }
    </div>
  )
}

export default Processor;