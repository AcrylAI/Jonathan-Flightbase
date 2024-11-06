import { Suspense, useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';

// Components
import RoundModalContainer from './RoundModalContainer';
import BroadcastModelModalContainer from './BroadcastModelModalContainer';
import EditMemoModalContainer from './EditMemoModalContainer';
import DeleteModelModalContainer from './DeleteModelModalContainer';
import JoinRequestsModalContainer from './JoinRequestsModalContainer';
import EditClientNameModalContainer from './EditClientNameModalContainer';
import DeleteClientModalContainer from './DeleteClientModalContainer';
import DeleteRounModalContainer from './DeleteRoundModalContainer';
import EditRoundMemoModalContainer from './EditRoundMemoModalContainer';
import StopRoundModalContainer from './StopRoundModalContainer';

// Modal Types
import {
  MODAL_CREATE_ROUND,
  MODAL_BROADCAST_MODEL,
  MODAL_EDIT_MEMO,
  MODAL_DELETE_MODEL,
  MODAL_JOINED_REQUESTS,
  MODAL_EDIT_CLIENT_NAME,
  MODAL_DELETE_CLIENT,
  MODAL_DELETE_ROUND,
  MODAL_EDIT_ROUND_MEMO,
  MODAL_STOP_ROUND,
} from '@src/utils/types';

function ModalContainer() {
  const modal = useSelector((state) => state.modal);
  const modalKeys = Object.keys(modal);

  useEffect(() => {
    if (modalKeys.length !== 0) {
      document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    } else {
      document.getElementsByTagName('body')[0].style.overflow = 'auto';
    }
  }, [modal, modalKeys.length]);

  return (
    <Suspense fallback={null}>
      {modalKeys.map((modalType, idx) => {
        return (
          <Fragment key={`${modalType}-${idx}`}>
            {modalType === MODAL_CREATE_ROUND && (
              <RoundModalContainer data={modal[modalType]} type={modalType} />
            )}
            {modalType === MODAL_DELETE_ROUND && (
              <DeleteRounModalContainer
                data={modal[modalType]}
                type={modalType}
              />
            )}
            {modalType === MODAL_STOP_ROUND && (
              <StopRoundModalContainer
                data={modal[modalType]}
                type={modalType}
              />
            )}
            {modalType === MODAL_BROADCAST_MODEL && (
              <BroadcastModelModalContainer
                data={modal[modalType]}
                type={modalType}
              />
            )}
            {modalType === MODAL_EDIT_MEMO && (
              <EditMemoModalContainer
                data={modal[modalType]}
                type={modalType}
              />
            )}
            {modalType === MODAL_EDIT_ROUND_MEMO && (
              <EditRoundMemoModalContainer
                data={modal[modalType]}
                type={modalType}
              />
            )}

            {modalType === MODAL_DELETE_MODEL && (
              <DeleteModelModalContainer
                data={modal[modalType]}
                type={modalType}
              />
            )}
            {modalType === MODAL_JOINED_REQUESTS && (
              <JoinRequestsModalContainer
                data={modal[modalType]}
                type={modalType}
              />
            )}
            {modalType === MODAL_EDIT_CLIENT_NAME && (
              <EditClientNameModalContainer
                data={modal[modalType]}
                type={modalType}
              />
            )}
            {modalType === MODAL_DELETE_CLIENT && (
              <DeleteClientModalContainer
                data={modal[modalType]}
                type={modalType}
              />
            )}
          </Fragment>
        );
      })}
    </Suspense>
  );
}

export default ModalContainer;
