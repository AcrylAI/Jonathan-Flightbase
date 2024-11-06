import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetcher, METHOD } from "@src/network/api/api";
import { Job } from "@src/werkzeug/defs/annotation"
import useToken from "../common/useToken";

function useGetJobDetail(jobId: string|number|undefined, view?: number) {
  const URL = "/job/detail";

  const navigate = useNavigate();
  const token = useToken();
  const [jobDetail, setJobDetail] = useState<Job|undefined>(undefined);

  const fetchJobDetail = async () => {
    if(!jobId || jobId === 0 || jobId === '0') throw new Error("No JobId");

    try {
      const response = await fetcher.query({
        headers: { token },
        url: URL,
        method: METHOD.GET,
        params: { id:jobId, view }
      })();

      if(!response?.result) return;
      setJobDetail(response.result);
    } catch (e) {
      throw e;
    }
  }

  useEffect(() => {
    if(jobId === undefined) return;

    fetchJobDetail()
      .then()
      .catch(e => {
        console.error(e);
        navigate(-1);
      });

    return () => {
      setJobDetail(undefined);
    }
  }, [jobId, token]);

  return jobDetail;
}

export default useGetJobDetail;