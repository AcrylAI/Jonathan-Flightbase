import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import useGetJobDetail from "@src/werkzeug/hooks/api/useGetJobDetail";
import useGetClasses from "@src/werkzeug/hooks/api/useGetClasses";
import usePaintStore from "@src/werkzeug/hooks/store/usePaintStore";
import useClearStore from "@src/werkzeug/hooks/store/useClearStore";
import useUnload from "@src/werkzeug/hooks/common/useUnload";
import { useResetRecoilState } from "recoil";
import { snackbarAtom } from "@src/stores/components/Snackbar/SnackbarStore";

function useWerkzeug() {
  const {
    projectId,
    view,
    /*workType*/
  } = useLocation().state || { projectId:0, view:undefined };
  const { jid } = useParams();

  const jobDetail = useGetJobDetail(jid, view);
  const classes = useGetClasses(projectId, jid);
  useClearStore();
  usePaintStore(jobDetail, classes);

  useUnload();

  const resetSnackbar = useResetRecoilState(snackbarAtom);
  useEffect(() => {
    return () => resetSnackbar();
  }, [])
}

export default useWerkzeug;