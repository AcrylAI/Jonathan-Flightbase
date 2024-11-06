import { useProjectData } from "@tools/hooks";
import { fetcher, METHOD } from "@src/network/api/api";

function useDeleteJobSave() {
  const URL = '/job/save';
  const { token } = useProjectData();

  const deleteJobSave = async (revertId: number) => {
    try {
      return await fetcher.query({
        method: METHOD.DELETE,
        headers: { token },
        url: URL,
        params: { id: revertId }
      })();
    } catch (e) {
      console.error(e);
    }
  }

  return {
    deleteJobSave
  }
}

export default useDeleteJobSave;