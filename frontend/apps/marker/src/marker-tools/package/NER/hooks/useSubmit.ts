import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { difference } from 'lodash';

import { usePostTextSave } from '@tools/hooks';

import { useToast } from '@tools/components/atoms';
import { useDeleteJobSave } from '@tools/hooks/api';
import { labelListAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';
import { JobDetailResultType } from '@tools/types/fetch';
import {
  INSPECTION_FILESTATE,
  REJECTION_FILESTATE,
  WORKING_FILESTATE,
} from '@tools/types/literal';
import { getUser } from '@tools/utils';

function useSubmit(detail: JobDetailResultType<TextAnnotationType>) {
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  const userName = getUser();
  const params = useParams();

  const [addLog, setAddLog] = useState<Array<TextAnnotationType>>([]);
  const [removeLog, setRemoveLog] = useState<Array<number>>([]);
  const [origin, setOrigin] = useState<Array<number>>([]);

  const labels = useRecoilValue<Array<TextAnnotationType>>(labelListAtom);

  const { show } = useToast({ limit: 1 });
  const { postSubmit, postSave, getJobFindLabelingId } = usePostTextSave();
  const { deleteJobSave } = useDeleteJobSave();

  useEffect(() => {
    setOrigin(detail.annotations.map((v) => v.id));
  }, [detail]);

  useEffect(() => {
    const add = labels.filter((v) => v.id < 0);
    setAddLog(add);
  }, [labels]);

  useEffect(() => {
    const curr = labels.filter((v) => v.id > 0).map((v) => v.id);
    const diff = difference(origin, curr);

    if (diff.length > 0) {
      setRemoveLog(diff);
    }
  }, [origin, labels]);

  const submit = async () => {
    const response = await postSubmit(addLog, [], removeLog);
    const _latestSubmit = params?.jid ? Number(params.jid) : 0;

    if (response.httpStatus === 200) {
      const nextId = detail.nextId || (await getJobFindLabelingId());

      if (nextId === (params?.jid ? Number(params.jid) : -1)) {
        navigate(0);
      }

      const path = pathname.split('/');
      path.pop();
      path.push(nextId.toString());

      show(() => deleteJobSave(_latestSubmit));

      const url = path.join('/');
      navigate(url, { state });
    }
  };

  const save = async () => {
    if (
      detail.fileStatus === WORKING_FILESTATE ||
      detail.fileStatus === REJECTION_FILESTATE
    ) {
      if (detail.labelerName === userName) {
        await postSave(addLog, [], removeLog);
      }
    } else if (detail.fileStatus === INSPECTION_FILESTATE) {
      if (detail.reviewerName === userName) {
        await postSave(addLog, [], removeLog);
      }
    }
  };

  return {
    submit,
    save,
  };
}

export default useSubmit;
