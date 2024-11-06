import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetcher, METHOD } from '@src/network/api/api';
import { useProjectData } from '@tools/hooks/utils';
import { TextAnnotationType } from '@tools/types/annotation';
import { JobDetailResultType } from '@tools/types/fetch';

function useGetTextDetail() {
  const navigate = useNavigate();
  const URL = '/text/detail';
  const { token, jobId, isView } = useProjectData();
  const [result, setResult] =
    useState<JobDetailResultType<TextAnnotationType> | null>(null);

  const fetching = async () => {
    if (jobId === 0 || token.length === 0)
      throw new Error('Invalid Token or JobId');

    try {
      const response = await fetcher.query({
        headers: { token },
        url: URL,
        method: METHOD.GET,
        params: { id: jobId, view: isView ? 1 : 0 },
      })();

      if (response.code === 400) return;

      setResult(response.result);
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
      setResult(null);
    };
  }, [token, jobId]);

  return result;
}

export default useGetTextDetail;
