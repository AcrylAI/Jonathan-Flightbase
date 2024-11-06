import { fetcher, METHOD } from '@src/network/api/api';
import { useProjectData } from '@tools/hooks/utils';

function usePostTextReject() {
  const URL = '/text/reject';
  const { token, jobId, projectId } = useProjectData();

  const postIssue = async (
    add: Array<any>,
    edit: Array<any>,
    remove: Array<number>,
  ) => {
    if (add.length === 0 && edit.length === 0 && remove.length === 0) {
      return;
    }

    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: URL,
        headers: { token },
      })({
        id: jobId,
        type: 0,
        add,
        edit,
        remove,
      });
    } catch (e) {
      throw e;
    }
  };

  const postReject = async (
    add: Array<any>,
    edit: Array<any>,
    remove: Array<number>,
  ) => {
    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: URL,
        headers: { token },
      })({
        id: jobId,
        type: 1,
        add,
        edit,
        remove,
      });
    } catch (e) {
      throw e;
    }
  };

  const getJobFindReviewingId = async () => {
    try {
      const response = await fetcher.query({
        method: METHOD.GET,
        url: '/job/find',
        params: { projectId, workType: 1 },
      })();

      return response?.result?.id ?? -1;
    } catch (e) {
      throw e;
    }
  };

  return {
    postIssue,
    postReject,
    getJobFindReviewingId,
  };
}

export default usePostTextReject;
