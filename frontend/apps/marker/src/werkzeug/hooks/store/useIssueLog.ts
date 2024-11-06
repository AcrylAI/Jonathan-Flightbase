import { useRecoilState } from "recoil";
import { issueLogAtom } from "@src/werkzeug/stores/historyStore";
import { Issue } from "@src/werkzeug/defs/annotation";
import { cloneDeep } from "lodash";

function useIssueLog() {
  const [issueLog, setIssueLog] = useRecoilState(issueLogAtom);

  const addIssueLog = (issue:Issue) => {
    const _issueLog = cloneDeep(issueLog);

    const index = _issueLog.add.findIndex(v => v.id === issue.id);
    if(index === -1) _issueLog.add.push(cloneDeep(issue));
    else             _issueLog.add[index] = cloneDeep(issue);

    setIssueLog(_issueLog);
  }

  const editIssueLog = (issue:Issue) => {
    const _issueLog = cloneDeep(issueLog);

    if(issue.id < 0) { // 새로 생성된 이슈인 경우
      const index = _issueLog.add.findIndex(v => v.id === issue.id);
      if(index === -1) return;
      _issueLog.add[index] = cloneDeep(issue);
    }
    else { // 기존 것을 수정하는 경우
      const index = _issueLog.edit.findIndex(v => v.id === issue.id);
      if(index === -1) return;
      _issueLog.edit[index] = cloneDeep(issue);
    }

    setIssueLog(_issueLog);
  }

  const deleteIssueLog = (issueId:number) => {
    if(issueLog.remove.includes(issueId)) return;

    const _issueLog = cloneDeep(issueLog);
    if(issueId < 0) { // 새로 생성된 것을 삭제하는 경우
      const index = _issueLog.add.findIndex(v => v.id === issueId);
      if(index === -1) return;
      _issueLog.add.splice(index, 1);
    }
    else { // 기존 것을 삭제하는 경우
      _issueLog.remove.push(issueId);
    }

    setIssueLog(_issueLog);
  }

  return {
    addIssueLog,
    editIssueLog,
    deleteIssueLog
  }
}

export default useIssueLog;