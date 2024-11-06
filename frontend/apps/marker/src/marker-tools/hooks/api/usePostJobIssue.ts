import { fetcher, METHOD } from '@src/network/api/api';
import { useProjectData } from '@tools/hooks/utils';

function usePostJobIssue() {
  const URL = '/job/issue';
  const { token } = useProjectData();

  const postIssueResolve = async (issueId: number) => {
    if (issueId < 0) return;

    try {
      return await fetcher.mut({
        method: METHOD.POST,
        url: URL,
        headers: { token },
      })({
        id: issueId,
      });
    } catch (e) {
      throw e;
    }
  };

  return {
    postIssueResolve,
  };
}

export default usePostJobIssue;
