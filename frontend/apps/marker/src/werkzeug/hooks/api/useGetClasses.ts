import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useToken from '../common/useToken';

import { fetcher, METHOD } from '@src/network/api/api';
import { Classes } from '@src/werkzeug/defs/classes';

function useGetClasses(
  projectId: string | number | undefined,
  jobId: string | number | undefined,
) {
  const URL = '/classes/';

  const navigate = useNavigate();
  const token = useToken();
  const [classes, setClasses] = useState<Array<Classes>>([]);

  const fetchClasses = async () => {
    if (!projectId || projectId === 0 || projectId === '0')
      throw new Error('No Project Id');

    try {
      const response = await fetcher.query({
        headers: { token },
        url: URL + projectId,
        method: METHOD.GET,
      })();

      if (!response.result?.class || response.result?.class.length === 0)
        return;
      setClasses(response.result.class);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    if (projectId === undefined) return;

    fetchClasses()
      .then()
      .catch((e) => {
        console.error(e);
        navigate(-1);
      });

    return () => {
      setClasses([]);
    };
  }, [projectId, token, jobId]);

  return classes;
}

export default useGetClasses;
