import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import JoinRequestsModal from '@src/components/pageContents/ClientPageContents/JoinRequestsModal';
import { toast } from '@src/components/uiContents/Toast';

// Types
import { MODAL_JOINED_REQUESTS } from '@src/utils/types';

// modules
import { closeModal } from '@src/store/modules/modal';

// API hooks
import useJoinRequestDecline from '@src/pages/ClientsPage/hooks/api/useJoinRequestDecline';
import useJoinRequestAccept from '@src/pages/ClientsPage/hooks/api/useJoinRequestAccept';
import useJoinRequestQuery from '@src/pages/ClientsPage/hooks/api/useJoinRequestQuery';

function JoinRequestsModalContainer({ data, type }) {
  const { getClientTableData, getIsJoinRequest } = data;

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const joinReqAcceptMutation = useJoinRequestAccept();

  const joinReqDeclineMutation = useJoinRequestDecline();

  const {
    data: {
      data: { result },
    },
    isLoading,
  } = useJoinRequestQuery({});

  const joinRequestsData = useMemo(() => {
    if (isLoading || !result) {
      return [];
    }

    const dataMap = result.map((d) => {
      const { address, join_request_datetime: joinRequestDateTime } = d;
      return {
        address,
        joinRequestDateTime,
        message: '',
      };
    });

    return dataMap;
  }, [isLoading, result]);

  /**
   * 합류 요청 허가
   * @param {string} address
   * @returns
   */
  const onAccept = async (address) => {
    const {
      data: { status, message },
    } = await joinReqAcceptMutation.onMutateAsync({
      body: {
        client_address: address,
      },
    });

    if (status === 0) {
      toast.error(message);
      return;
    }

    dispatch(closeModal(MODAL_JOINED_REQUESTS));

    toast.success(t('clients.toast.joinRequestAccepted.success.label'));

    getClientTableData();
    getIsJoinRequest();
  };

  /**
   * 합류 요청 거절
   * @param {string} address
   * @returns
   */
  const onDecline = async (address) => {
    const {
      data: { status, message },
    } = await joinReqDeclineMutation.onMutateAsync({
      body: {
        client_address: address,
      },
    });

    if (status === 0) {
      toast.error(message);
      return;
    }

    dispatch(closeModal(MODAL_JOINED_REQUESTS));

    toast.success(t('clients.toast.joinRequestDecline.success.label'));

    getIsJoinRequest();
  };

  return (
    <JoinRequestsModal
      type={type}
      isLoading={isLoading}
      joinRequestsData={joinRequestsData}
      onAccept={onAccept}
      onDecline={onDecline}
    />
  );
}

export default JoinRequestsModalContainer;
