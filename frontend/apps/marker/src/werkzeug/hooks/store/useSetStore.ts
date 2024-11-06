import { useLocation, useParams } from "react-router-dom";
import useToken from "@src/werkzeug/hooks/common/useToken";
import { useSetRecoilState } from "recoil";
import { classListAtom, jobInfoAtom } from "@src/werkzeug/stores/fetchStore";
import { issueListAtom, labelListAtom } from "@src/werkzeug/stores/paintStore";
import { fetcher, METHOD } from "@src/network/api/api";
import { cloneDeep } from "lodash";
import { Annotation, Job, Label } from "@src/werkzeug/defs/annotation";
import { Classes } from "@src/werkzeug/defs/classes";

function useSetStore() {
  const { projectId } = useLocation().state || { projectId: 0, view: undefined };
  const { jid } = useParams();
  const token = useToken();

  const setJobInfo = useSetRecoilState(jobInfoAtom);
  const setClasses = useSetRecoilState(classListAtom);
  const setLabelList = useSetRecoilState(labelListAtom);
  const setIssueList = useSetRecoilState(issueListAtom);

  const fetchJobInfo = async () => {
    if(!jid || jid === '0') throw 'No Job Id';

    try {
      const jobDetail = await fetcher.query({
        headers: { token },
        url: '/job/detail',
        method: METHOD.GET,
        params: { id:jid }
      })();

      if(!jobDetail?.result) return undefined;
      setJobInfo(jobDetail.result);

      return jobDetail.result;
    } catch (e) {
      throw e;
    }
  }

  const fetchClasses = async () => {
    if(!projectId || projectId === 0 || projectId === '0') throw 'No Project Id';

    try {
      const classes = await fetcher.query({
        headers: { token },
        url: `/classes/${projectId}`,
        method: METHOD.GET
      })();

      if(!classes.result?.class || classes.result?.class.length === 0) return undefined;
      setClasses(classes.result.class);

      return classes.result.class;
    } catch (e) {
      throw e;
    }
  }

  const parseLabelList = (jobInfo:Job, classes:Array<Classes>) => {
    const annotation = cloneDeep(jobInfo.annotations);
    const labelList:Array<Label> = classes.map(v => ({
      classId: v.id,
      type: v.tool,
      className: v.name,
      annotation: [],
      visibility: true
    }));

    for (let i = 0; i < labelList.length; i++) {
      const currId = labelList[i].classId;

      for (let j = 0; j < annotation.length; j++) {
        if(currId === annotation[j].classId) {
          const [label]:Array<Annotation> = cloneDeep(annotation.splice(j, 1));
          labelList[i].annotation.push({ ...label, visibility: true });
          j -= 1;
        }
      }
    }

    setLabelList(labelList);
  }

  const parseIssueList = (jobInfo:Job) => {
    const issueList = cloneDeep(jobInfo.issue);
    setIssueList(issueList);
  }

  const setStores = async () => {
    const jobInfo = await fetchJobInfo();
    const classes = await fetchClasses();

    if(!jobInfo || !classes) return;

    parseLabelList(jobInfo, classes);
    parseIssueList(jobInfo);
  }

  return {
    setStores
  }
}

export default useSetStore;