import { useRecoilValue } from "recoil";
import { jobInfoAtom } from "@src/werkzeug/stores/fetchStore";

function useFileStatus() {
  const jobInfo = useRecoilValue(jobInfoAtom);

  const isLabeler = (() => {
    if(!jobInfo) return undefined;

    return (jobInfo.labelFlag === 1)
  })();

  const isViewer = (() => {
    if(!jobInfo) return undefined;

    return (jobInfo.labelFlag === 0);
  })()

  const canIUse = (() => {
    if(!jobInfo || isLabeler === undefined) return undefined;

    if(isViewer === true) return false;

    if(isLabeler) { // 라벨러인 경우
      return ([2, 4].includes(jobInfo.fileStatus));
    }
    else { // 검수자인 경우
      return (jobInfo.fileStatus === 3);
    }
  })();

  return {
    isLabeler, isViewer, canIUse
  }
}

export default useFileStatus;