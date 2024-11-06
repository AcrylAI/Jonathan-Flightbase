import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectData } from '@tools/hooks';

import { fetcher, METHOD } from '@src/network/api/api';
import { ClassesResultType } from '@tools/types/fetch';

function useGetClass() {
  const navigate = useNavigate();
  const URL = '/classes/';
  const { token, projectId } = useProjectData();
  const [result, setResult] = useState<Array<ClassesResultType>>([]);

  const fetching = async () => {
    if (projectId === 0 || token.length === 0)
      throw new Error('Invalid Token or ProjectId');

    try {
      const response = await fetcher.query({
        headers: { token },
        url: URL + projectId,
        method: METHOD.GET,
      })();

      if (response.code === 400) return;

      setResult(response.result?.class ?? []);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    fetching()
      .then()
      .catch((e) => {
        console.error(e);
        navigate(-1);
      });

    return () => {
      setResult([]);
    };
  }, [token, projectId]);

  return result;
}

export default useGetClass;
