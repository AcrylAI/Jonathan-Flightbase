import { useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { cloneDeep } from "lodash";
import { Annotation, Job, Label } from "@src/werkzeug/defs/annotation";
import { Classes } from "@src/werkzeug/defs/classes";
import { classListAtom, jobInfoAtom } from "@src/werkzeug/stores/fetchStore";
import { issueListAtom, labelListAtom } from "@src/werkzeug/stores/paintStore";

function usePaintStore(jobDetail:Job|undefined, classes:Array<Classes>) {
  const [jobInfo, setJobInfo] = useRecoilState(jobInfoAtom);
  const [classList, setClassList] = useRecoilState(classListAtom);
  const setLabelList = useSetRecoilState(labelListAtom);
  const setIssueList = useSetRecoilState(issueListAtom);

  useEffect(() => {
    if(!jobDetail) return;
    setJobInfo(jobDetail);
  }, [jobDetail])

  useEffect(() => {
    if(!classes || classes.length === 0) return;
    setClassList(classes);
  }, [classes])

  useEffect(() => {
    /* @optionalBinding */ if(!jobInfo || classList.length === 0) return;

    const _annotation = cloneDeep(jobInfo.annotations);
    const _labelList:Array<Label> = classList.map(v => ({
      classId: v.id,
      type: v.tool,
      className: v.name,
      annotation: [],
      visibility: true
    }));

    for (let i = 0; i < _labelList.length; i++) {
      const curId = _labelList[i].classId;
      for (let j = 0; j < _annotation.length; j++) {
        if(curId === _annotation[j].classId) {
          const [label]:Array<Annotation> = cloneDeep(_annotation.splice(j, 1));
          _labelList[i].annotation.push({ ...label, visibility: true });
          j -= 1;
        }
      }
    }

    setLabelList(_labelList);
  }, [jobInfo, classList])

  useEffect(() => {
    if(!jobInfo) return;

    const _issueList = cloneDeep(jobInfo.issue);
    setIssueList(_issueList);
  }, [jobInfo])
}

export default usePaintStore;