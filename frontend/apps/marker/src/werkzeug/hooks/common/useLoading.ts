import { useRecoilValue } from "recoil";
import { classListAtom, jobInfoAtom } from "@src/werkzeug/stores/fetchStore";

function useLoading() {
  const jobInfo = useRecoilValue(jobInfoAtom);
  const classInfo = useRecoilValue(classListAtom);

  const isPaintLoading = (() => {
    return (jobInfo === undefined || classInfo === undefined);
  })();

  return {
    isPaintLoading
  };
}

export default useLoading;