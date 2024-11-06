import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { fetcher, JSON_HEADER, METHOD } from '@src/network/api/api';

function useCasingNer() {
  const { pathname } = useLocation();
  const [pid, setPid] = useState(0);
  const [type, setType] = useState(0);

  const getType = async (projectId: number) => {
    if (projectId === 0) return 0;

    try {
      const response = await fetcher.query({
        url: '/project/meta',
        method: METHOD.GET,
        headers: {
          ...JSON_HEADER,
        },
        params: {
          projectId,
        },
      })();

      if (response.httpStatus !== 200) {
        return 0;
      }

      return response.result?.type ?? 0;
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const split = pathname.split('/');
    if (split.length > 3) {
      const num = Number(split[3]);
      setPid(isNaN(num) ? 0 : num);
    } else {
      setPid(0);
    }
  }, [pathname]);

  useEffect(() => {
    getType(pid)
      .then((res) => {
        setType(res);
      })
      .catch(() => {
        setType(0);
      });
  }, [pid]);

  return {
    type,
  };
}

export default useCasingNer;
