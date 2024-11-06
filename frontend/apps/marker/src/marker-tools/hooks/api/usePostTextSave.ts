import { fetcher, METHOD } from '@src/network/api/api';
import { useProjectData } from '@tools/hooks/utils';
import { TextAnnotationType } from '@tools/types/annotation';

function usePostTextSave() {
  const URL = '/text/save';
  const { token, jobId, projectId } = useProjectData();

  const postSave = async (
    add: Array<TextAnnotationType>,
    edit: Array<TextAnnotationType>,
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

  const postSubmit = async (
    add: Array<TextAnnotationType>,
    edit: Array<TextAnnotationType>,
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

  const getJobFindLabelingId = async () => {
    try {
      const response = await fetcher.query({
        method: METHOD.GET,
        url: '/job/find',
        params: { projectId, workType: 0 },
      })();

      return response?.result?.id ?? -1;

      // if(result === -1 || result === jobId) {
      //   navigate(0);
      //   return 0
      // }

      // return result;
    } catch (e) {
      throw e;
    }
  };

  return {
    postSave,
    postSubmit,
    getJobFindLabelingId,
  };
}

export default usePostTextSave;
