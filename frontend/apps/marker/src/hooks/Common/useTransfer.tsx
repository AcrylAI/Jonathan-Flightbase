import { useNavigate } from 'react-router-dom';

import { toast } from '@src/components/molecules/Toast';

import { COMMON_URL } from '@src/utils/pageUrls';

import { fetcher, METHOD } from '@src/network/api/api';
import useT from "@src/hooks/Locale/useT";
import { DataType } from "@tools/types/label";

function useTransfer(tools?: DataType) {
  const { t } = useT();
  const navigate = useNavigate();

  const getLabelingURL = (jobId: number, tools?: DataType) => {
    switch (tools) {
      // case 0:
      //   return COMMON_URL.INSPECTION_IMAGE_PAGE.replace(':jid', String(jobId));
      case 1:
        return COMMON_URL.LABELING_TEXT_PAGE.replace(':jid', String(jobId));
      default:
        return COMMON_URL.ANNOTATION_PAGE.replace(':jid', String(jobId));
    }
  }

  const getIssueURL = (jobId: number, tools?: DataType) => {
    switch (tools) {
      // case 0:
      //   return COMMON_URL.INSPECTION_IMAGE_PAGE.replace(':jid', String(jobId));
      case 1:
        return COMMON_URL.INSPECTION_TEXT_PAGE.replace(':jid', String(jobId));
      default:
        return COMMON_URL.ANNOTATION_PAGE.replace(':jid', String(jobId));
    }
  }

  const getViewURL = (jobId: number, tools?: DataType) => {
    switch (tools) {
      // case 0:
      //   return COMMON_URL.VIEW_IMAGE_PAGE.replace(':jid', String(jobId));
      case 1:
        return COMMON_URL.VIEW_TEXT_PAGE.replace(':jid', String(jobId));
      default:
        return COMMON_URL.ANNOTATION_PAGE.replace(':jid', String(jobId));
    }
  }

  /**  */
  const moveToJob = async (projectId: number, jobId: number, tools?: DataType) => {
    if (jobId !== 0) {
      // const url = COMMON_URL.ANNOTATION_PAGE.replace(':jid', String(jobId));
      const url = getViewURL(jobId, tools);
      navigate(url, {
        state: {
          projectId,
          view: 1,
        },
      });
    }
    else {
      toast.error(t(`toast.useTransfer.moveFail`));
    }
  };

  /**  */
  const moveToLabeling = async (projectId: string | number, tools?: DataType) => {
    if (projectId === 0 || projectId === '0') throw new Error('No ProjectId');

    try {
      const res = await fetcher.query({
        method: METHOD.GET,
        url: '/job/find',
        params: { projectId, workType: 0 },
      })();

      const jobId = res.result.id;

      if (jobId === 0 || Number.isNaN(jobId)) {
        toast.error(t(`toast.useTransfer.noWork`));
        return;
      }

      // const url = COMMON_URL.ANNOTATION_PAGE.replace(':jid', String(jobId));
      // const url = COMMON_URL.LABELING_IMAGE_PAGE.replace(':jid', String(jobId));
      const url = getLabelingURL(jobId, tools);
      navigate(url, {
        state: {
          projectId,
          workType: 0,
        },
      });
    } catch (e) {
      toast.error(t(`toast.useTransfer.getWorkFail`));
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const moveToReview = async (projectId: string | number, tools?: DataType) => {
    if (projectId === 0 || projectId === '0') throw new Error('No ProjectId');

    try {
      const res = await fetcher.query({
        method: METHOD.GET,
        url: '/job/find',
        params: { projectId, workType: 1 },
      })();

      const jobId = res.result.id;

      if (jobId === 0 || Number.isNaN(jobId)) {
        toast.error(t(`toast.useTransfer.noWork`));
        return;
      }

      // const url = COMMON_URL.ANNOTATION_PAGE.replace(':jid', String(jobId));
      // const url = COMMON_URL.INSPECTION_IMAGE_PAGE.replace(':jid', String(jobId));
      const url = getIssueURL(jobId, tools);
      navigate(url, {
        state: {
          projectId,
          workType: 1,
        },
      });
    } catch (e) {
      toast.error(t(`toast.useTransfer.getWorkFail`));
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return {
    moveToJob,
    moveToLabeling,
    moveToReview,
  };
}

export default useTransfer;
