import { fetcher, METHOD } from '@src/network/api/api';
import { useProjectData } from '@tools/hooks/utils';

function usePostTextApproval() {
  const URL = '/text/approval';
  const { token, jobId } = useProjectData();

  const postApproval = async () => {
    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: URL,
        headers: { token },
      })({
        id: jobId,
      });
    } catch (e) {
      throw e;
    }
  };

  return {
    postApproval,
  };
}

export default usePostTextApproval;
