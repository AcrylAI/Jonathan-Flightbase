import { useRecoilState, useRecoilValue } from "recoil";
import { jobInfoAtom } from "@src/werkzeug/stores/fetchStore";
import { useEffect, useState } from "react";
import DrawManager from "@src/werkzeug/lib/DrawManager";
import {
  adjustmentAtom, issueListAtom,
  labelListAtom,
  scaleAtom,
  selectedAnnotationAtom, selectedIssueAtom,
  shapeModifyModeAtom
} from "@src/werkzeug/stores/paintStore";
import { selectedClassAtom, selectedToolAtom } from "@src/werkzeug/stores/contextStore";
import useLabelLog from "@src/werkzeug/hooks/store/useLabelLog";
import useIssueLog from "@src/werkzeug/hooks/store/useIssueLog";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
import { issueLogAtom, labelLogAtom } from "@src/werkzeug/stores/historyStore";

function usePaint() {
  const jobInfo = useRecoilValue(jobInfoAtom);
  const adjustment = useRecoilValue(adjustmentAtom);
  const selectedTool = useRecoilValue(selectedToolAtom);
  const selectedClass = useRecoilValue(selectedClassAtom);

  const [labelList, setLabelList] = useRecoilState(labelListAtom);
  const [selectedAnno, setSelectedAnno] = useRecoilState(selectedAnnotationAtom);
  const [shapeModifyMode, setShapeModifyMode] = useRecoilState(shapeModifyModeAtom);
  const [issueList, setIssueList] = useRecoilState(issueListAtom);
  const [selectedIssue, setSelectedIssue] = useRecoilState(selectedIssueAtom);
  const [scale, setScale] = useRecoilState(scaleAtom);
  const [labelHistory] = useRecoilState(labelLogAtom);

  const { addLabelLog, editLabelLog, deleteLabelLog } = useLabelLog();
  const { deleteIssueLog } = useIssueLog();
  const { canIUse } = useFileStatus();

  const [manager, setManager] = useState<DrawManager|undefined>(undefined);

  /** @effect jobInfo 변경 시 manager를 새롭게 설정하는 side-effect */
  useEffect(() => {
    if(jobInfo === undefined || canIUse === undefined) return;

    const _manager = new DrawManager(jobInfo.url, canIUse, (jobInfo.labelFlag === 0));
    setManager(_manager);

    return () => {
      setManager(undefined);
    }
  }, [jobInfo, canIUse])

  /** @effect scale 변경 시 해당 scale로 zoom을 설정하는 side-effect */
  useEffect(() => {
    /* @optionalBinding */ if(!manager || scale === -1) return;
    manager.zooming(scale);
  }, [manager, scale])

  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.useScaleAtom(setScale);
  }, [manager, setScale])

  /** @effect adjustment 변경 시 변경값을 이미지에 적용하는 side-effect */
  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.setAdjustment(adjustment);
  }, [manager, adjustment])

  /** @effect selectedTool 변경 시, manager에 selectedTool을 넘겨주는 side-effect */
  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.tool = selectedTool;
  }, [manager, selectedTool])

  /** @effect labelListAtom 변경 시, manager에 해당 리코일 정보를 넘겨주는 side-effect*/
  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.useLabelListAtom(labelList, setLabelList);
  }, [manager, labelList, setLabelList])

  /** @effect selectedAnnoAtom 변경 시, manager에 해당 리코일 정보를 넘겨주는 side-effect */
  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.useSelectedAnnoAtom(selectedAnno, setSelectedAnno);
  }, [manager, selectedAnno, setSelectedAnno])

  /** @effect selectedClassAtom 변경 시, manager에 해당 리코일 정보를 넘겨주는 side-effect */
  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.useSelectedClassAtom(selectedClass);
  }, [manager, selectedClass])

  /** @effect 특정 이벤트 발생 시 react component에 알리기 위한 리코일 정보를 넘겨주는 side-effect */
  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.useShapeModifyAtom(shapeModifyMode, setShapeModifyMode);
  }, [manager, shapeModifyMode, setShapeModifyMode])

  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.useLabelLogSelector(addLabelLog, editLabelLog, deleteLabelLog);
  }, [manager, editLabelLog, deleteLabelLog])

  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.useIssueListAtom(issueList, setIssueList);
  }, [manager, issueList])

  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.useSelectedIssueAtom(selectedIssue, setSelectedIssue);
  }, [manager, selectedIssue])

  useEffect(() => {
    /* @optionalBinding */ if(!manager) return;
    manager.useIssueLogSelector(deleteIssueLog);
  }, [manager, deleteIssueLog])
}

export default usePaint;