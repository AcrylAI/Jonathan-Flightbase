import { useRecoilValue } from "recoil";
import { useParams } from "react-router-dom";
import useToken from "@src/werkzeug/hooks/common/useToken";
import { issueLogAtom } from "@src/werkzeug/stores/historyStore";
import { fetcher, METHOD } from "@src/network/api/api";

function usePostJobReject() {
  const REJECT_URL = '/job/reject';
  const ARRPOVE_URL = '/job/approval';
  const ISSUE_URL = '/job/issue';

  const { jid } = useParams();
  const token = useToken();

  const issueLog = useRecoilValue(issueLogAtom);

  const isEmpty = (() => {
    return (
      issueLog.add.length === 0
      && issueLog.edit.length === 0
      && issueLog.remove.length === 0
    )
  })();

  const saveReview = async () => {
    if(isEmpty) return;

    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: REJECT_URL,
        headers: { token }
      })({
        id: jid,
        type: 0,
        add: issueLog.add,
        edit: issueLog.edit,
        remove: issueLog.remove
      });
    } catch (e) {
      throw e;
    }
  }

  const rejectReview = async () => {
    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: REJECT_URL,
        headers: { token }
      })({
        id: jid,
        type: 1,
        add: issueLog.add,
        edit: issueLog.edit,
        remove: issueLog.remove
      })
    } catch (e) {
      throw e;
    }
  }

  const approveReview = async () => {
    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: ARRPOVE_URL,
        headers: { token }
      })({
        id: jid
      })
    } catch (e) {
      throw e;
    }
  }

  const resolveIssue = async (issueId:number) => {
    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: ISSUE_URL,
        headers: { token }
      })({
        id: issueId
      })
    } catch (e) {
      throw e;
    }
  }

  return {
    saveReview,
    rejectReview,
    approveReview,
    resolveIssue
  }
}

export default usePostJobReject;