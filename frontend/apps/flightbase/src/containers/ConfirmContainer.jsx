import { useCallback } from 'react';

// Plugin
import { useSelector, useDispatch } from 'react-redux';

// Actions
import { closeConfirm } from '@src/store/modules/confirm';

// Components
import ConfirmPopup from '@src/components/organisms/ConfirmPopup';

function ConfirmContainer() {
  // Redux Hooks
  const dispatch = useDispatch();
  const { isOpen, confirmData } = useSelector(({ confirm }) => confirm);

  const onClose = useCallback(() => {
    dispatch(closeConfirm());
  }, [dispatch]);

  return <>{isOpen && <ConfirmPopup {...confirmData} close={onClose} />}</>;
}

export default ConfirmContainer;
