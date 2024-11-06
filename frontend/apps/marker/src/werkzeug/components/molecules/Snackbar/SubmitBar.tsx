import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { RED502 } from "@src/utils/color";
import useT from "@src/hooks/Locale/useT";
import { Sypo } from "@src/components/atoms";
import { wait } from "@src/werkzeug/lib/Util";
import usePathfinder from "@src/werkzeug/hooks/common/usePathfinder";
import usePostJobSave from "@src/werkzeug/hooks/api/usePostJobSave";
import { jobInfoAtom, latestSubmitAtom } from "@src/werkzeug/stores/fetchStore";
import { snackbarAtom } from "@src/stores/components/Snackbar/SnackbarStore";
import { Button } from "@src/werkzeug/components/atoms";

import classNames from "classnames/bind";
import styles from "./Snackbar.module.scss";

const cx = classNames.bind(styles);
const { Select } = Button;

function SubmitBar() {
  const { t } = useT();

  const jobInfo = useRecoilValue(jobInfoAtom);
  const [snackbar, setSnackbar] = useRecoilState(snackbarAtom);
  const latestSubmitId = useRecoilValue(latestSubmitAtom);
  const { moveToFind } = usePathfinder();
  const { revertJob } = usePostJobSave();

  const [handler, setHandler] = useState<any>(undefined);

  const isReject = (() => {
    if(!jobInfo) return false;
    return (jobInfo.rejectCnt > 0);
  })();

  const rejectColor = (() => {
    if(!isReject) {
      return 'rgba(250, 78, 87, 0.3)';
    }
    else {
      return RED502;
    }
  })();

  const resetSnackbar = async () => {
    setSnackbar(cur => ({...cur, show: false}));
    await wait(200);
    setSnackbar(cur => ({...cur, contents: null}))
  }

  const onClickUndo = async () => {
    if(latestSubmitId > 0) {
      try {
        await revertJob(latestSubmitId);
      } catch (e) {
        console.error(e);
      }
    }
    await resetSnackbar();
  }

  const onClickReject = async () => {
    if(isReject) {
      await resetSnackbar();
      await moveToFind();
    }
  }

  useEffect(() => {
    if(snackbar.show) {
      const id = setTimeout(async () => {
        setSnackbar(cur => ({...cur, show: false}));
        await wait(200);
        setSnackbar(cur => ({...cur, contents: null}))
      }, 15000);

      setHandler(id);
    }
  }, [snackbar])

  useEffect(() => {
    if(!snackbar.show) {
      clearTimeout(handler)
      setHandler(undefined)
    }
  }, [snackbar, handler])

  return (
    <div className={ cx("SubmitBar") }>
      <Sypo type='p1' weight={500}>{t(`toast.submitbar.submitted`)}</Sypo>
      <div className={ cx("box") }>
        <Select onClick={onClickUndo} padding={"4px 16px"}>
          <Sypo type='p1' weight={400}>{t(`toast.submitbar.undo`)}</Sypo>
        </Select>
        <Select onClick={onClickReject} disable={!isReject} padding={"4px 16px"}>
          <Sypo type='p1' weight={400} color={rejectColor}>
            {t(`toast.submitbar.rejecttext`, { count: `${jobInfo?.rejectCnt || 0}` })}
          </Sypo>
        </Select>
      </div>
    </div>
  )
}

export default SubmitBar;