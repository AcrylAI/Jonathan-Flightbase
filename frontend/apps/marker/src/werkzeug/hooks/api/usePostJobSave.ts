import { useRecoilValue, useSetRecoilState } from "recoil";
import { useParams } from "react-router-dom";
import useToken from "@src/werkzeug/hooks/common/useToken";
import { labelLogAtom } from "@src/werkzeug/stores/historyStore";
import { fetcher, METHOD } from "@src/network/api/api";
import { latestSubmitAtom } from "@src/werkzeug/stores/fetchStore";
import usePathfinder from "@src/werkzeug/hooks/common/usePathfinder";

function usePostJobSave() {
  const SAVE_URL = '/job/save';
  // const SKIP_URL = '/job/skip';

  const { jid } = useParams();
  const token = useToken();
  const { reload } = usePathfinder();

  const labelHistory = useRecoilValue(labelLogAtom);
  const setLatestSubmitId = useSetRecoilState(latestSubmitAtom);

  const isEmpty = (() => {
    return (
      labelHistory.add.length === 0
      && labelHistory.edit.length === 0
      && labelHistory.remove.length === 0
    )
  })();

  const saveJob = async () => {
    if(isEmpty) return ;

    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: SAVE_URL,
        headers: { token },
      })({
        id: jid,
        type: 0,
        add: labelHistory.add,
        edit: labelHistory.edit,
        remove: labelHistory.remove,
      });
    } catch (e) {
      throw e;
    }
  }

  const submitJob = async () => {
    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: SAVE_URL,
        headers: { token },
      })({
        id: jid,
        type: 1,
        add: labelHistory.add,
        edit: labelHistory.edit,
        remove: labelHistory.remove
      });
    } catch (e) {
      throw e;
    }
  }

  const revertJob = async (revertId:number) => {
    if(revertId === 0) return;

    try {
      await fetcher.query({
        method: METHOD.DELETE,
        url: SAVE_URL,
        headers: { token },
        params: { id: revertId }
      })()

      if(Number(jid) === revertId) {
        await reload();
      }
    } catch (e) {
      console.error(e);
    }
    finally {
      setLatestSubmitId(0);
    }
  }

  return {
    saveJob,
    submitJob,
    revertJob,
  }
}

export default usePostJobSave;