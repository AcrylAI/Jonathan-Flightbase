import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { difference } from 'lodash';

import { usePostTextApproval, usePostTextReject } from '@tools/hooks/api';
import { issueListAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';
import { JobDetailResultType } from '@tools/types/fetch';
import {
  INSPECTION_FILESTATE,
  REJECTION_FILESTATE,
  WORKING_FILESTATE,
} from '@tools/types/literal';
import { getUser } from '@tools/utils';

function useReject(detail: JobDetailResultType<TextAnnotationType>) {
  const { state, pathname } = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const userName = getUser();

  const [addLog, setAddLog] = useState<Array<TextAnnotationType>>([]);
  const [removeLog, setRemoveLog] = useState<Array<number>>([]);
  const [origin, setOrigin] = useState<Array<number>>([]);

  const issues = useRecoilValue<Array<TextAnnotationType>>(issueListAtom);

  const { postReject, postIssue, getJobFindReviewingId } = usePostTextReject();
  const { postApproval } = usePostTextApproval();

  useEffect(() => {
    setOrigin(detail.issue.map((v) => v.id));
  }, [detail]);

  useEffect(() => {
    const add = issues.filter(
      (v) => v.id < 0 && v.comment && v.comment?.length > 0,
    );
    setAddLog(add);
  }, [issues]);

  useEffect(() => {
    const curr = issues.filter((v) => v.id > 0).map((v) => v.id);
    const diff = difference(origin, curr);

    if (diff.length > 0) {
      setRemoveLog(diff);
    }
  }, [origin, issues]);

  const reject = async () => {
    const response = await postReject(addLog, [], removeLog);

    if (response.httpStatus === 200) {
      const nextId = detail.nextId || (await getJobFindReviewingId());

      if(nextId === (params?.jid ? Number(params.jid) : -1)) {
        navigate(0);
      }

      const path = pathname.split('/');
      path.pop();
      path.push(nextId.toString());

      const url = path.join('/');
      navigate(url, { state });
    }
  };

  const saveIssue = async () => {
    if (
      detail.fileStatus === WORKING_FILESTATE ||
      detail.fileStatus === REJECTION_FILESTATE
    ) {
      if (detail.labelerName === userName) {
        await postIssue(addLog, [], removeLog);
      }
    } else if (detail.fileStatus === INSPECTION_FILESTATE) {
      if (detail.reviewerName === userName) {
        await postIssue(addLog, [], removeLog);
      }
    }
  };

  const approve = async () => {
    const response = await postApproval();

    if (response.httpStatus === 200) {
      const nextId = detail.nextId || (await getJobFindReviewingId());

      if(nextId === (params?.jid ? Number(params.jid) : -1)) {
        navigate(0);
      }

      const path = pathname.split('/');
      path.pop();
      path.push(nextId.toString());

      const url = path.join('/');
      navigate(url, { state });
    }
  };

  return {
    reject,
    saveIssue,
    approve,
  };
}

export default useReject;
