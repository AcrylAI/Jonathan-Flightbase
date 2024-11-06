import { TextAnnotationType } from '@tools/types/annotation';
import { JobDetailResultType } from '@tools/types/fetch';
import { FileStatus } from '@tools/types/label';
import {
  INSPECTION_FILESTATE,
  REJECTION_FILESTATE,
  WORKING_FILESTATE,
} from '@tools/types/literal';
import { getUser } from '@tools/utils';
import { useLocation } from "react-router-dom";

function useEventDisable(detail?: JobDetailResultType<TextAnnotationType>) {
  const pathname = useLocation().pathname.split('/');
  const currentUser = getUser();

  const allowByFileStatus = (allowStatus: FileStatus | Array<FileStatus>) => {
    if (!detail?.fileStatus) return false;

    if (typeof allowStatus === 'number') {
      return detail.fileStatus === allowStatus;
    }

    return allowStatus.includes(detail.fileStatus);
  };

  const allowByPath = (allowPath: string | Array<string>) => {
    if (typeof allowPath === 'string') {
      return pathname[1] === allowPath;
    }

    return allowPath.includes(pathname[1]);
  };

  const allowBySameUser = (targetUser: string | Array<string>) => {
    if (typeof targetUser === 'string') {
      return targetUser === currentUser;
    }

    return targetUser.includes(currentUser ?? '');
  };

  const allowByManager = (allowStatus: FileStatus) => {
    if (
      allowStatus === WORKING_FILESTATE ||
      allowStatus === REJECTION_FILESTATE
    ) {
      return currentUser === detail?.labelerName;
    }
    if (allowStatus === INSPECTION_FILESTATE) {
      return currentUser === detail?.reviewerName;
    }
    return false;
  };

  return {
    allowByFileStatus,
    allowByPath,
    allowBySameUser,
    allowByManager,
  };
}

export default useEventDisable;
