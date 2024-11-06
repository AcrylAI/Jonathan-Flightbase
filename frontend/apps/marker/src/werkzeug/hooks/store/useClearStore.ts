import { useEffect } from "react";
import { useResetRecoilState } from "recoil";
import { classListAtom, jobInfoAtom, onDataLoadAtom } from "@src/werkzeug/stores/fetchStore";
import { selectedClassAtom, selectedToolAtom } from "@src/werkzeug/stores/contextStore";
import {
  adjustmentAtom, issueListAtom,
  labelListAtom,
  scaleAtom,
  selectedAnnotationAtom, selectedIssueAtom,
  selectedPropertiesAtom, shapeModifyModeAtom
} from "@src/werkzeug/stores/paintStore";
import { issueLogAtom, labelLogAtom } from "@src/werkzeug/stores/historyStore";
import { useParams } from "react-router-dom";

function useClearStore() {
  const { jid } = useParams();

  // context Store
  const resetSelectedTool = useResetRecoilState(selectedToolAtom);
  const resetSelectedClass = useResetRecoilState(selectedClassAtom);

  // fetch Store
  const resetJobInfo = useResetRecoilState(jobInfoAtom);
  const resetClassList = useResetRecoilState(classListAtom);
  const resetOnDataLoad = useResetRecoilState(onDataLoadAtom);

  // history Store
  const resetLabelHistory = useResetRecoilState(labelLogAtom);
  const resetIssueHistory = useResetRecoilState(issueLogAtom);

  // paint Store
  const resetAdjustment = useResetRecoilState(adjustmentAtom);
  const resetScale = useResetRecoilState(scaleAtom);
  const resetLabelList = useResetRecoilState(labelListAtom);
  const resetSelectedAnno = useResetRecoilState(selectedAnnotationAtom);
  const resetSelectedProp = useResetRecoilState(selectedPropertiesAtom);
  const resetIssueList = useResetRecoilState(issueListAtom);
  const resetSelectedIssue = useResetRecoilState(selectedIssueAtom);
  const resetModifyMode = useResetRecoilState(shapeModifyModeAtom);

  const forcedClear = async () => {
    resetJobInfo();
    resetClassList();
    resetSelectedTool();
    resetSelectedClass();
    resetAdjustment();
    resetScale();
    resetLabelList();
    resetSelectedAnno();
    resetSelectedProp();
    resetIssueList();
    resetSelectedIssue();
    resetLabelHistory();
    resetIssueHistory();
    resetModifyMode();
    resetOnDataLoad();
  }

  // useEffect(() => {
  //   return () => {
  //     forcedClear().then();
  //   }
  // }, [jid])

  return {
    forcedClear
  }
}

export default useClearStore;