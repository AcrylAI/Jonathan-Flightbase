import { useLocation, useNavigate, useParams } from "react-router-dom";
import { COMMON_URL } from "@src/utils/pageUrls";
import { fetcher, METHOD } from "@src/network/api/api";
import useClearStore from "@src/werkzeug/hooks/store/useClearStore";
import useSetStore from "@src/werkzeug/hooks/store/useSetStore";

function usePathfinder() {
  const navigate = useNavigate();
  const { projectId, view } = useLocation().state || { projectId: 0, view: undefined };

  const { jid } = useParams();
  const { setStores } = useSetStore();
  const { forcedClear } = useClearStore();

  const movePath = (jobId: number) => {
    forcedClear().then(async () => {
      if(jobId === 0) {
        setTimeout(() => {
          navigate(0);
        }, 100)
      }
      else {
        const url = COMMON_URL.ANNOTATION_PAGE.replace(':jid', String(jobId));
        navigate(url, {
          state: { projectId, view },
          replace: true
        });
      }
    })
  }

  const reload = async () => {
    if(!jid || jid === '0') {
      console.error('No Job Id');
      return;
    }

    await forcedClear();

    try {
      await setStores();
    } catch (e) {
      console.error(e);
      navigate(0);
    }
  }

  const moveToFind = async () => {
    if(projectId === 0 || projectId === '0') {
      console.error('No Project Id');
      return;
    }

    try {
      const res = await fetcher.query({
        method: METHOD.GET,
        url: '/job/find',
        params: { projectId, workType: 0 },
      })();

      const jobId = res.result.id;

      if(jobId === 0 || isNaN(jobId)) {
        console.error('No Job Id');
        return;
      }

      movePath(jobId);
    } catch (e) {
      console.error(e);
    }
  }

  return {
    movePath,
    reload,
    moveToFind,
  }
}

export default usePathfinder;