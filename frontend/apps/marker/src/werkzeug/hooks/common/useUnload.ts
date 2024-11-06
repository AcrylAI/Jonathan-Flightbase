import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { issueLogAtom, labelLogAtom } from "@src/werkzeug/stores/historyStore";
import usePostJobSave from "@src/werkzeug/hooks/api/usePostJobSave";
import usePostJobReject from "@src/werkzeug/hooks/api/usePostJobReject";
import useClearStore from "@src/werkzeug/hooks/store/useClearStore";

function useUnload() {
  const labelLog = useRecoilValue(labelLogAtom);
  const issueLog = useRecoilValue(issueLogAtom);

  const { saveJob } = usePostJobSave();
  const { saveReview } = usePostJobReject();
  const { forcedClear } = useClearStore();

  const isLabelLogEmpty = (() => {
    return (
      labelLog.add.length === 0
      && labelLog.edit.length === 0
      && labelLog.remove.length === 0
    )
  })();

  const isIssueLogEmpty = (() => {
    return (
      issueLog.add.length === 0
      && issueLog.edit.length === 0
      && issueLog.remove.length === 0
    )
  })();

  useEffect(() => {
    const onBeforeUnload = () => {
      if(!isLabelLogEmpty) {
        saveJob().then(() => {
          forcedClear().then()
        });
      }
      if(isIssueLogEmpty) {
        saveReview().then(() => {
          forcedClear().then()
        });
      }
    }

    const onPopstate = () => {
      if(!isLabelLogEmpty) {
        saveJob().then(() => {
          forcedClear().then()
        });
      }
      if(isIssueLogEmpty) {
        saveReview().then(() => {
          forcedClear().then()
        });
      }
    }

    window.onbeforeunload = onBeforeUnload;
    window.addEventListener('popstate', onPopstate);
    return () => {
      window.onbeforeunload = () => undefined;
      window.removeEventListener('popstate', onPopstate);
    }
  }, [isLabelLogEmpty, isIssueLogEmpty]);
}

export default useUnload;